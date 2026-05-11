package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.PolicyCancellationRequestDto;
import com.vehicleinsurance.dto.PolicyCancellationRequestResponse;
import com.vehicleinsurance.dto.BuyPolicyRequest;
import com.vehicleinsurance.dto.PolicyResponse;
import com.vehicleinsurance.entity.*;
import com.vehicleinsurance.exception.BadRequestException;
import com.vehicleinsurance.exception.ResourceNotFoundException;
import com.vehicleinsurance.repository.PolicyRepository;
import com.vehicleinsurance.repository.PolicyCancellationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final PolicyCancellationRequestRepository cancellationRequestRepository;
    private final AuthService authService;
    private final VehicleService vehicleService;
    private final InsurancePlanService planService;
    private final PdfGenerationService pdfGenerationService;
    private final com.vehicleinsurance.service.AdminPlanService adminPlanService;
    private final com.vehicleinsurance.service.PremiumCalculationService premiumCalculationService;

    @Transactional
    public PolicyResponse buyPolicy(BuyPolicyRequest request) {
        User user = authService.getCurrentUser();
        Vehicle vehicle = vehicleService.getEntity(request.getVehicleId());
        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Vehicle does not belong to you");
        }
        
        // Check if user already has an active policy for this vehicle
        var existingPolicy = policyRepository.findByUserIdAndVehicleId(user.getId(), vehicle.getId());
        if (existingPolicy.isPresent() && existingPolicy.get().getStatus() == Policy.PolicyStatus.ACTIVE) {
            throw new BadRequestException("You already have an active policy for this vehicle. Please renew your existing policy instead.");
        }
        
        InsurancePlan plan = planService.getEntity(request.getInsurancePlanId());
        if (!plan.getActive()) {
            throw new BadRequestException("Insurance plan is not available");
        }

        LocalDate start = LocalDate.now();
        LocalDate end = start.plusMonths(plan.getCoverageMonths());

        String policyNumber;
        do {
            policyNumber = "POL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (policyRepository.existsByPolicyNumber(policyNumber));

        Policy policy = new Policy();
        policy.setPolicyNumber(policyNumber);
        policy.setUser(user);
        policy.setVehicle(vehicle);
        policy.setInsurancePlan(plan);
        // Compute premium server-side to avoid tampering. Use base calculation and optionally apply admin plan.
        java.math.BigDecimal computedPremium;
        com.vehicleinsurance.entity.AdminPlan adminPlan = null;
        if (request.getAdminPlanId() != null) {
            adminPlan = adminPlanService.getById(request.getAdminPlanId());
        }

        try {
            var premiumResp = premiumCalculationService.calculatePremium(vehicle, request.getPolicyType(), adminPlan);
            computedPremium = premiumResp.getFinalPremium() == null ? premiumResp.getTotalPremium() : premiumResp.getFinalPremium();
        } catch (Exception ex) {
            // Fallback: use client-provided amount if any, otherwise plan's premium amount
            computedPremium = request.getPremiumAmount() != null ? request.getPremiumAmount() : plan.getPremiumAmount();
        }

        policy.setPremiumAmount(computedPremium);
        if (adminPlan != null) {
            policy.setAdminPlan(adminPlan);
        }
        policy.setPolicyType(Policy.PolicyType.valueOf(request.getPolicyType()));
        policy.setStartDate(start);
        policy.setEndDate(end);
        policy.setStatus(Policy.PolicyStatus.ACTIVE);
        policy.setPaymentStatus(Policy.PaymentStatus.SUCCESS);
        policy.setPaymentMethod(Policy.PaymentMethod.valueOf(request.getPaymentMethod()));

        policy = policyRepository.save(policy);
        return toResponse(policy);
    }

    public List<PolicyResponse> getMyPolicies() {
        User user = authService.getCurrentUser();
        return policyRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PolicyResponse> getMyActivePolicies() {
        User user = authService.getCurrentUser();
        return policyRepository.findByUserIdAndStatus(user.getId(), Policy.PolicyStatus.ACTIVE).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public PolicyResponse getPolicy(Long id) {
        User user = authService.getCurrentUser();
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", "id", id));
        if (!policy.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Policy", "id", id);
        }
        return toResponse(policy);
    }

    public Policy getEntity(Long id) {
        return policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", "id", id));
    }

    public List<PolicyResponse> getAllPoliciesForAdmin() {
        return policyRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public PolicyResponse renewPolicy(Long policyId) {
        User user = authService.getCurrentUser();
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", "id", policyId));
        
        // Verify user owns this policy
        if (!policy.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Policy", "id", policyId);
        }
        
        // Check if policy is active
        if (policy.getStatus() != Policy.PolicyStatus.ACTIVE) {
            throw new BadRequestException("Only active policies can be renewed");
        }
        
        InsurancePlan plan = policy.getInsurancePlan();
        
        // Extend the policy end date by the coverage period
        LocalDate newEndDate = policy.getEndDate().plusMonths(plan.getCoverageMonths());
        policy.setEndDate(newEndDate);
        
        // Optionally update premium amount if needed
        policy.setPremiumAmount(plan.getPremiumAmount());
        
        policy = policyRepository.save(policy);
        return toResponse(policy);
    }

    /**
     * Generate PDF for a policy
     */
    @Transactional(readOnly = true)
    public byte[] generatePolicyPdf(Long policyId) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        User currentUser = authService.getCurrentUser();
        boolean isAdmin = currentUser.getRoles().stream()
            .map(Role::getName)
            .anyMatch(rn -> rn == Role.RoleName.ROLE_ADMIN);
        
        if (!policy.getUser().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new BadRequestException("Permission denied");
        }

        return pdfGenerationService.generatePolicyPdf(policy);
    }

    @Transactional
    public PolicyCancellationRequestResponse requestCancellation(Long policyId, PolicyCancellationRequestDto request) {
        User user = authService.getCurrentUser();
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy", "id", policyId));

        // Verify user owns this policy
        if (!policy.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Policy", "id", policyId);
        }

        // Check if policy is active
        if (policy.getStatus() != Policy.PolicyStatus.ACTIVE) {
            throw new BadRequestException("Only active policies can be cancelled");
        }

        // Check if there's already a pending request
        var existingRequest = cancellationRequestRepository.findByPolicyIdAndStatus(
                policyId, 
                com.vehicleinsurance.entity.PolicyCancellationRequest.RequestStatus.PENDING
        );
        if (existingRequest.isPresent()) {
            throw new BadRequestException("A cancellation request for this policy is already pending admin approval");
        }

        // Create cancellation request
        com.vehicleinsurance.entity.PolicyCancellationRequest cancellationRequest = new com.vehicleinsurance.entity.PolicyCancellationRequest();
        cancellationRequest.setPolicy(policy);
        cancellationRequest.setUser(user);
        cancellationRequest.setCancellationReason(request.getCancellationReason());
        cancellationRequest.setStatus(com.vehicleinsurance.entity.PolicyCancellationRequest.RequestStatus.PENDING);

        cancellationRequest = cancellationRequestRepository.save(cancellationRequest);
        return toResponse(cancellationRequest);
    }

    public List<PolicyCancellationRequestResponse> getCancellationRequests() {
        User user = authService.getCurrentUser();
        return cancellationRequestRepository.findByUserIdOrderByRequestedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PolicyCancellationRequestResponse> getAllCancellationRequestsForAdmin() {
        return cancellationRequestRepository.findAllByOrderByRequestedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<PolicyCancellationRequestResponse> getPendingCancellationRequestsForAdmin() {
        return cancellationRequestRepository.findByStatusOrderByRequestedAtDesc(
                com.vehicleinsurance.entity.PolicyCancellationRequest.RequestStatus.PENDING
        ).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PolicyCancellationRequestResponse approveCancellation(Long requestId, String adminRemarks) {
        User admin = authService.getCurrentUser();
        
        com.vehicleinsurance.entity.PolicyCancellationRequest request = cancellationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Cancellation request", "id", requestId));

        if (request.getStatus() != com.vehicleinsurance.entity.PolicyCancellationRequest.RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be approved");
        }

        // Approve the request
        request.setStatus(com.vehicleinsurance.entity.PolicyCancellationRequest.RequestStatus.APPROVED);
        request.setApprovedAt(LocalDateTime.now());
        request.setAdminRemarks(adminRemarks);
        request.setApprovedByAdmin(admin);

        // Cancel the policy
        Policy policy = request.getPolicy();
        policy.setStatus(Policy.PolicyStatus.CANCELLED);
        policyRepository.save(policy);

        request = cancellationRequestRepository.save(request);
        return toResponse(request);
    }

    @Transactional
    public PolicyCancellationRequestResponse rejectCancellation(Long requestId, String adminRemarks) {
        User admin = authService.getCurrentUser();
        
        com.vehicleinsurance.entity.PolicyCancellationRequest request = cancellationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Cancellation request", "id", requestId));

        if (request.getStatus() != com.vehicleinsurance.entity.PolicyCancellationRequest.RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be rejected");
        }

        // Reject the request
        request.setStatus(com.vehicleinsurance.entity.PolicyCancellationRequest.RequestStatus.REJECTED);
        request.setApprovedAt(LocalDateTime.now());
        request.setAdminRemarks(adminRemarks);
        request.setApprovedByAdmin(admin);

        request = cancellationRequestRepository.save(request);
        return toResponse(request);
    }

    private PolicyCancellationRequestResponse toResponse(com.vehicleinsurance.entity.PolicyCancellationRequest req) {
        return new PolicyCancellationRequestResponse(
                req.getId(),
                req.getPolicy().getId(),
                req.getPolicy().getPolicyNumber(),
                req.getUser().getId(),
                req.getUser().getFullName(),
                req.getUser().getEmail(),
                req.getCancellationReason(),
                req.getStatus(),
                req.getRequestedAt(),
                req.getApprovedAt(),
                req.getAdminRemarks(),
                req.getApprovedByAdmin() != null ? req.getApprovedByAdmin().getId() : null,
                req.getApprovedByAdmin() != null ? req.getApprovedByAdmin().getFullName() : null
        );
    }

    private PolicyResponse toResponse(Policy p) {
        // Compute final premium using PremiumCalculationService if admin plan present
        java.math.BigDecimal finalPremium = p.getPremiumAmount();
        Long adminPlanId = null;
        String adminPlanName = null;
        try {
            if (p.getAdminPlan() != null) {
                adminPlanId = p.getAdminPlan().getId();
                adminPlanName = p.getAdminPlan().getPlanName();
                var resp = premiumCalculationService.calculatePremium(p.getVehicle(), p.getPolicyType().name(), p.getAdminPlan());
                if (resp != null && resp.getFinalPremium() != null) {
                    finalPremium = resp.getFinalPremium();
                }
            }
        } catch (Exception ex) {
            // fallback to stored premiumAmount on any error
            finalPremium = p.getPremiumAmount();
        }

        return new PolicyResponse(
                p.getId(), p.getPolicyNumber(), p.getUser().getId(), p.getUser().getFullName(),
                p.getVehicle().getId(), p.getVehicle().getVehicleNumber(),
                p.getPremiumAmount(), p.getStartDate(), p.getEndDate(),
                p.getStatus(), p.getPaymentStatus(), p.getPolicyType(), p.getPaymentMethod(), p.getPurchasedAt(),
                adminPlanId, adminPlanName, finalPremium
        );
    }
}

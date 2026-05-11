package com.vehicleinsurance.controller;

import com.vehicleinsurance.dto.BuyPolicyRequest;
import com.vehicleinsurance.dto.PolicyCancellationRequestDto;
import com.vehicleinsurance.dto.PolicyCancellationRequestResponse;
import com.vehicleinsurance.dto.PolicyResponse;
import com.vehicleinsurance.service.PolicyService;
import com.vehicleinsurance.service.PremiumCalculationService;
import com.vehicleinsurance.dto.PremiumBreakupResponse;
import com.vehicleinsurance.entity.Vehicle;
import com.vehicleinsurance.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")

@RequiredArgsConstructor
public class PolicyController {
    private final PolicyService policyService;
    private final PremiumCalculationService premiumCalculationService;
    private final VehicleService vehicleService;
    private final com.vehicleinsurance.service.AdminPlanService adminPlanService;
    @GetMapping("/calculate-premium")
    public ResponseEntity<PremiumBreakupResponse> calculatePremium(@RequestParam Long vehicleId, @RequestParam String policyType,
                                                                    @RequestParam(value = "adminPlanId", required = false) Long adminPlanId) {
        Vehicle vehicle = vehicleService.getEntity(vehicleId);
        PremiumBreakupResponse resp;
        if (adminPlanId != null) {
            var plan = adminPlanService.getById(adminPlanId);
            resp = premiumCalculationService.calculatePremium(vehicle, policyType, plan);
        } else {
            resp = premiumCalculationService.calculatePremium(vehicle, policyType);
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/buy")
    public ResponseEntity<PolicyResponse> buyPolicy(@Valid @RequestBody BuyPolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyService.buyPolicy(request));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<PolicyResponse> renewPolicy(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.renewPolicy(id));
    }

    @PostMapping("/{id}/cancel-request")
    public ResponseEntity<PolicyCancellationRequestResponse> requestCancellation(@PathVariable Long id, 
                                                                                  @Valid @RequestBody PolicyCancellationRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyService.requestCancellation(id, request));
    }

    @GetMapping
    public ResponseEntity<List<PolicyResponse>> getMyPolicies() {
        return ResponseEntity.ok(policyService.getMyPolicies());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PolicyResponse>> getMyActivePolicies() {
        return ResponseEntity.ok(policyService.getMyActivePolicies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PolicyResponse> getPolicy(@PathVariable Long id) {
        return ResponseEntity.ok(policyService.getPolicy(id));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPolicyPdf(@PathVariable Long id) {
        byte[] pdfContent = policyService.generatePolicyPdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"policy.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }

    @GetMapping("/cancellation-requests/my")
    public ResponseEntity<List<PolicyCancellationRequestResponse>> getMyCancellationRequests() {
        return ResponseEntity.ok(policyService.getCancellationRequests());
    }
}

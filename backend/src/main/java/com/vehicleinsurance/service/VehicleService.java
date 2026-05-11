package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.VehicleRequest;
import com.vehicleinsurance.dto.VehicleResponse;
import com.vehicleinsurance.entity.User;
import com.vehicleinsurance.entity.Vehicle;
import com.vehicleinsurance.entity.Document;
import com.vehicleinsurance.exception.BadRequestException;
import com.vehicleinsurance.exception.ResourceNotFoundException;
import com.vehicleinsurance.repository.VehicleRepository;
import com.vehicleinsurance.repository.ClaimRepository;
import com.vehicleinsurance.repository.DocumentRepository;
import com.vehicleinsurance.repository.PolicyCancellationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final AuthService authService;
    private final com.vehicleinsurance.repository.PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final DocumentRepository documentRepository;
    private final PolicyCancellationRequestRepository policyCancellationRequestRepository;

    @Transactional
    public VehicleResponse addVehicle(VehicleRequest request) {
        User user = authService.getCurrentUser();
        if (vehicleRepository.existsByVehicleNumber(request.getVehicleNumber())) {
            throw new BadRequestException("Vehicle number already registered");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setEngineCC(request.getEngineCC());
        vehicle.setExShowroomPrice(request.getExShowroomPrice());
        vehicle.setUser(user);

        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    public List<VehicleResponse> getMyVehicles() {
        User user = authService.getCurrentUser();
        return vehicleRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponse getVehicle(Long id) {
        User user = authService.getCurrentUser();
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Vehicle", "id", id);
        }
        return toResponse(vehicle);
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        User user = authService.getCurrentUser();
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Vehicle", "id", id);
        }
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setEngineCC(request.getEngineCC());
        vehicle.setExShowroomPrice(request.getExShowroomPrice());
        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        User user = authService.getCurrentUser();
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Vehicle", "id", id);
        }
        
        // Check if vehicle has any active policies
        List<com.vehicleinsurance.entity.Policy> policies = policyRepository.findByVehicleId(vehicle.getId());
        boolean hasActivePolicies = policies.stream()
                .anyMatch(p -> p.getStatus() == com.vehicleinsurance.entity.Policy.PolicyStatus.ACTIVE);
        
        if (hasActivePolicies) {
            throw new BadRequestException("Cannot delete vehicle with active policies. Please expire or cancel all policies first.");
        }
        
        // Delete cascade: Vehicle -> Policies -> (Claims + Cancellation Requests) -> Documents
        for (com.vehicleinsurance.entity.Policy policy : policies) {
            // Delete policy cancellation requests for this policy
            policyCancellationRequestRepository.deleteByPolicyId(policy.getId());
            
            // Get all claims for this policy and delete them with their documents
            List<com.vehicleinsurance.entity.Claim> claims = claimRepository.findByPolicyId(policy.getId());
            
            // Delete documents and claims attached to each claim
            for (com.vehicleinsurance.entity.Claim claim : claims) {
                documentRepository.deleteByRelatedEntityIdAndRelatedEntityType(
                    claim.getId(), 
                    Document.RelatedEntityType.CLAIM
                );
                // Delete the claim itself
                claimRepository.delete(claim);
            }
            
            // Now delete the policy
            policyRepository.delete(policy);
        }
        
        // Finally delete the vehicle
        vehicleRepository.delete(vehicle);
    }

    public Vehicle getEntity(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", id));
    }

    private VehicleResponse toResponse(Vehicle v) {
        return new VehicleResponse(v.getId(), v.getVehicleNumber(), v.getVehicleType(),
                v.getBrand(), v.getModel(), v.getManufacturingYear(), v.getEngineCC(), v.getExShowroomPrice());
    }
}

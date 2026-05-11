package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.UserResponse;
import com.vehicleinsurance.entity.Role;
import com.vehicleinsurance.repository.ClaimRepository;
import com.vehicleinsurance.repository.PolicyRepository;
import com.vehicleinsurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCustomers", userRepository.countByRoleName(Role.RoleName.ROLE_CUSTOMER));
        stats.put("totalPolicies", policyRepository.countAllPolicies());
        stats.put("activePolicies", policyRepository.countActivePolicies());
        stats.put("totalClaims", claimRepository.countAllClaims());
        stats.put("pendingClaims", claimRepository.countPendingClaims());
        return stats;
    }

    public java.util.List<UserResponse> getAllCustomers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().name().equals("ROLE_CUSTOMER")))
                .map(u -> new UserResponse(
                        u.getId(), u.getFullName(), u.getEmail(), u.getPhone(),
                        u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet())
                ))
                .collect(Collectors.toList());
    }
}

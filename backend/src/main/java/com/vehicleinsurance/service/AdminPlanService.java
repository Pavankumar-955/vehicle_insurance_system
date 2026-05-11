package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.AdminPlanRequest;
import com.vehicleinsurance.entity.AdminPlan;
import com.vehicleinsurance.entity.Policy;
import com.vehicleinsurance.exception.ResourceNotFoundException;
import com.vehicleinsurance.repository.AdminPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPlanService {

    private final AdminPlanRepository adminPlanRepository;

    @Transactional
    public AdminPlan createAdminPlan(AdminPlanRequest req) {
        AdminPlan p = new AdminPlan();
        p.setPlanName(req.getPlanName());
        p.setPolicyType(req.getPolicyType());
        p.setExtraAmount(req.getExtraAmount());
        p.setExtraPercentage(req.getExtraPercentage());
        p.setMinEngineCC(req.getMinEngineCC());
        p.setMaxEngineCC(req.getMaxEngineCC());
        p.setDescription(req.getDescription());
        p.setActive(req.getIsActive() == null ? true : req.getIsActive());
        return adminPlanRepository.save(p);
    }

    @Transactional(readOnly = true)
    public AdminPlan getById(Long id) {
        return adminPlanRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("AdminPlan", "id", id));
    }

    @Transactional(readOnly = true)
    public List<AdminPlan> listActivePlans() {
        return adminPlanRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<AdminPlan> findApplicablePlans(Policy.PolicyType policyType, Integer engineCC) {
        List<AdminPlan> plans = adminPlanRepository.findByIsActiveTrueAndPolicyType(policyType);
        return plans.stream().filter(p -> {
            if (engineCC == null) return true;
            if (p.getMinEngineCC() != null && engineCC < p.getMinEngineCC()) return false;
            if (p.getMaxEngineCC() != null && engineCC > p.getMaxEngineCC()) return false;
            return true;
        }).collect(Collectors.toList());
    }

    @Transactional
    public AdminPlan updateAdminPlan(Long id, AdminPlanRequest req) {
        AdminPlan p = getById(id);
        if (req.getPlanName() != null) p.setPlanName(req.getPlanName());
        if (req.getPolicyType() != null) p.setPolicyType(req.getPolicyType());
        p.setExtraAmount(req.getExtraAmount());
        p.setExtraPercentage(req.getExtraPercentage());
        p.setMinEngineCC(req.getMinEngineCC());
        p.setMaxEngineCC(req.getMaxEngineCC());
        p.setDescription(req.getDescription());
        if (req.getIsActive() != null) p.setActive(req.getIsActive());
        return adminPlanRepository.save(p);
    }
}

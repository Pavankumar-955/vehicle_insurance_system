package com.vehicleinsurance.controller;

import com.vehicleinsurance.dto.AdminPlanRequest;
import com.vehicleinsurance.dto.AdminPlanResponse;
import com.vehicleinsurance.entity.AdminPlan;
import com.vehicleinsurance.entity.Policy;
import com.vehicleinsurance.service.AdminPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin-plans")
@RequiredArgsConstructor
public class AdminPlanController {

    private final AdminPlanService adminPlanService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminPlanResponse> create(@RequestBody AdminPlanRequest req) {
        AdminPlan p = adminPlanService.createAdminPlan(req);
        return ResponseEntity.ok(map(p));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminPlanResponse> update(@PathVariable Long id, @RequestBody AdminPlanRequest req) {
        AdminPlan p = adminPlanService.updateAdminPlan(id, req);
        return ResponseEntity.ok(map(p));
    }

    @GetMapping
    public ResponseEntity<List<AdminPlanResponse>> list(@RequestParam(value = "policyType", required = false) String policyType,
                                                       @RequestParam(value = "engineCC", required = false) Integer engineCC) {
        List<AdminPlan> plans;
        if (policyType == null) {
            plans = adminPlanService.listActivePlans();
        } else {
            Policy.PolicyType pt = Policy.PolicyType.valueOf(policyType.toUpperCase());
            plans = adminPlanService.findApplicablePlans(pt, engineCC);
        }
        List<AdminPlanResponse> res = plans.stream().map(this::map).collect(Collectors.toList());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminPlanResponse> get(@PathVariable Long id) {
        AdminPlan p = adminPlanService.getById(id);
        return ResponseEntity.ok(map(p));
    }

    private AdminPlanResponse map(AdminPlan p) {
        AdminPlanResponse r = new AdminPlanResponse();
        r.setId(p.getId());
        r.setPlanName(p.getPlanName());
        r.setPolicyType(p.getPolicyType().name());
        r.setExtraAmount(p.getExtraAmount());
        r.setExtraPercentage(p.getExtraPercentage());
        r.setMinEngineCC(p.getMinEngineCC());
        r.setMaxEngineCC(p.getMaxEngineCC());
        r.setDescription(p.getDescription());
        r.setIsActive(p.isActive());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }
}

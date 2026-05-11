package com.vehicleinsurance.repository;

import com.vehicleinsurance.entity.AdminPlan;
import com.vehicleinsurance.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminPlanRepository extends JpaRepository<AdminPlan, Long> {
    List<AdminPlan> findByIsActiveTrue();
    List<AdminPlan> findByIsActiveTrueAndPolicyType(Policy.PolicyType policyType);
}

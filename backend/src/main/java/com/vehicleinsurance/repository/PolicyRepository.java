package com.vehicleinsurance.repository;

import com.vehicleinsurance.entity.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PolicyRepository extends JpaRepository<Policy, Long> {

    List<Policy> findByUserId(Long userId);

    List<Policy> findByUserIdAndStatus(Long userId, Policy.PolicyStatus status);

    java.util.Optional<Policy> findByUserIdAndVehicleId(Long userId, Long vehicleId);

    boolean existsByPolicyNumber(String policyNumber);

    @Query("SELECT COUNT(p) FROM Policy p WHERE p.status = 'ACTIVE'")
    long countActivePolicies();

    @Query("SELECT COUNT(p) FROM Policy p")
    long countAllPolicies();

    // Find all policies for a vehicle (used when deleting a vehicle)
    List<Policy> findByVehicleId(Long vehicleId);

    // Delete all policies for a vehicle (used when deleting a vehicle)
    @Modifying
    @Transactional
    @Query("DELETE FROM Policy p WHERE p.vehicle.id = :vehicleId")
    void deleteByVehicleId(@Param("vehicleId") Long vehicleId);
}

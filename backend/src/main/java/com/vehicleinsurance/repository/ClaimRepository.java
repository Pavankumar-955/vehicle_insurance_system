package com.vehicleinsurance.repository;

import com.vehicleinsurance.entity.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    List<Claim> findByUserId(Long userId);

    boolean existsByClaimNumber(String claimNumber);

    @Query("SELECT COUNT(c) FROM Claim c WHERE c.status = 'PENDING'")
    long countPendingClaims();

    @Query("SELECT COUNT(c) FROM Claim c")
    long countAllClaims();

    // Find all claims for a policy (used when deleting policies)
    List<Claim> findByPolicyId(Long policyId);
}

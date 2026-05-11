package com.vehicleinsurance.repository;

import com.vehicleinsurance.entity.PolicyCancellationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PolicyCancellationRequestRepository extends JpaRepository<PolicyCancellationRequest, Long> {
    List<PolicyCancellationRequest> findByUserIdOrderByRequestedAtDesc(Long userId);
    List<PolicyCancellationRequest> findByStatusOrderByRequestedAtDesc(PolicyCancellationRequest.RequestStatus status);
    List<PolicyCancellationRequest> findAllByOrderByRequestedAtDesc();
    Optional<PolicyCancellationRequest> findByPolicyIdAndStatus(Long policyId, PolicyCancellationRequest.RequestStatus status);

    // Delete all cancellation requests for a policy (used when deleting policies)
    @Modifying
    @Transactional
    @Query("DELETE FROM PolicyCancellationRequest p WHERE p.policy.id = :policyId")
    void deleteByPolicyId(@Param("policyId") Long policyId);
}

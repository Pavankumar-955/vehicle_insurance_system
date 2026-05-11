package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.PolicyCancellationRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyCancellationRequestResponse {

    private Long id;
    private Long policyId;
    private String policyNumber;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String cancellationReason;
    private PolicyCancellationRequest.RequestStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private String adminRemarks;
    private Long approvedByAdminId;
    private String approvedByAdminName;
}

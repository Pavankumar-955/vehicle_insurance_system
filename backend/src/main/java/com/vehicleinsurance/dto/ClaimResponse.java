package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.Claim;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse {

    private Long id;
    private String claimNumber;
    private Long userId;
    private String userFullName;
    private Long policyId;
    private String policyNumber;
    private String claimDescription;
    private Claim.SettlementType claimSettlementType;
    private Claim.ClaimStatus status;
    private String adminRemark;
    private LocalDateTime submittedAt;
    private LocalDateTime resolvedAt;
}

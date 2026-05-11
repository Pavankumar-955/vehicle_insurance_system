package com.vehicleinsurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClaimRequest {

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    @NotBlank(message = "Claim description is required")
    @Size(max = 500)
    private String claimDescription;

    @NotNull(message = "Settlement type is required")
    @Pattern(regexp = "CASHLESS|REIMBURSEMENT", message = "Settlement type must be CASHLESS or REIMBURSEMENT")
    private String claimSettlementType;
}

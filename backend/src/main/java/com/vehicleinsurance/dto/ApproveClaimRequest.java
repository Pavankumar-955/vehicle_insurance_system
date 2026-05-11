package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.Claim;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApproveClaimRequest {

    @NotNull(message = "Status is required")
    private Claim.ClaimStatus status;

    @Size(max = 500)
    private String adminRemark;
}

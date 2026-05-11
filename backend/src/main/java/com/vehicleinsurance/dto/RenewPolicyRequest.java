package com.vehicleinsurance.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenewPolicyRequest {

    @NotNull(message = "Policy ID is required")
    private Long policyId;
}

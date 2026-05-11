package com.vehicleinsurance.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BuyPolicyRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Insurance plan ID is required")
    private Long insurancePlanId;

    @NotNull(message = "Policy type is required")
    @Pattern(regexp = "COMPREHENSIVE|THIRD_PARTY", message = "Policy type must be COMPREHENSIVE or THIRD_PARTY")
    private String policyType;

    @NotNull(message = "Premium amount is required")
    @Positive(message = "Premium amount must be positive")
    private BigDecimal premiumAmount;

    // Optional admin plan id (nullable)
    private Long adminPlanId;

    @NotNull(message = "Payment method is required")
    @Pattern(regexp = "UPI|CREDIT_DEBIT_CARD|NET_BANKING", message = "Payment method must be UPI, CREDIT_DEBIT_CARD, or NET_BANKING")
    private String paymentMethod;
}

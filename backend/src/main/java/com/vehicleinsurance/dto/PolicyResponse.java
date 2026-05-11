package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.Policy;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyResponse {

    private Long id;
    private String policyNumber;
    private Long userId;
    private String userFullName;
    private Long vehicleId;
    private String vehicleNumber;
    private BigDecimal premiumAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private Policy.PolicyStatus status;
    private Policy.PaymentStatus paymentStatus;
    private Policy.PolicyType policyType;
    private Policy.PaymentMethod paymentMethod;
    private LocalDateTime purchasedAt;
    // Admin plan information (optional)
    private Long adminPlanId;
    private String adminPlanName;
    private java.math.BigDecimal finalPremium; // final premium after applying admin plan (if any)
}

package com.vehicleinsurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PremiumBreakupResponse {
    private String policyType;
    private Integer vehicleAge;
    private BigDecimal depreciationPercentage; // null for THIRD_PARTY
    private BigDecimal idv; // null for THIRD_PARTY
    private BigDecimal ownDamagePremium; // 0 for THIRD_PARTY
    private BigDecimal thirdPartyPremium;
    private BigDecimal gst;
    private BigDecimal totalPremium;
    // Admin plan related (optional)
    private String adminPlanName;
    private BigDecimal adminExtraAmount;
    private BigDecimal adminExtraPercentage;
    private BigDecimal finalPremium; // after applying admin plan

    // Backwards-compatible constructor used by existing code (base calculation)
    public PremiumBreakupResponse(String policyType, Integer vehicleAge, BigDecimal depreciationPercentage, BigDecimal idv,
                                  BigDecimal ownDamagePremium, BigDecimal thirdPartyPremium, BigDecimal gst, BigDecimal totalPremium) {
        this.policyType = policyType;
        this.vehicleAge = vehicleAge;
        this.depreciationPercentage = depreciationPercentage;
        this.idv = idv;
        this.ownDamagePremium = ownDamagePremium;
        this.thirdPartyPremium = thirdPartyPremium;
        this.gst = gst;
        this.totalPremium = totalPremium;
        this.adminPlanName = null;
        this.adminExtraAmount = null;
        this.adminExtraPercentage = null;
        this.finalPremium = totalPremium;
    }
}

package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.Policy;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AdminPlanRequest {
    private String planName;
    private Policy.PolicyType policyType;
    private BigDecimal extraAmount;
    private BigDecimal extraPercentage;
    private Integer minEngineCC;
    private Integer maxEngineCC;
    private String description;
    private Boolean isActive;
}

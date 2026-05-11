package com.vehicleinsurance.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AdminPlanResponse {
    private Long id;
    private String planName;
    private String policyType;
    private BigDecimal extraAmount;
    private BigDecimal extraPercentage;
    private Integer minEngineCC;
    private Integer maxEngineCC;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

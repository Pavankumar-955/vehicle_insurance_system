package com.vehicleinsurance.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String planName;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Policy.PolicyType policyType = Policy.PolicyType.COMPREHENSIVE;

    @Column(precision = 10, scale = 2)
    private BigDecimal extraAmount; // fixed extra amount (nullable)

    @Column(precision = 5, scale = 2)
    private BigDecimal extraPercentage; // percentage over base premium (nullable)

    private Integer minEngineCC; // optional

    private Integer maxEngineCC; // optional

    @Column(length = 500)
    private String description;

    private boolean isActive = true;

    private LocalDateTime createdAt = LocalDateTime.now();
}

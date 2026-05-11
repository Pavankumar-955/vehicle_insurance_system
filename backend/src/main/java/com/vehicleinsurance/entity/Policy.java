package com.vehicleinsurance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Policy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String policyNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "insurance_plan_id", nullable = false)
    private InsurancePlan insurancePlan;

    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal premiumAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private PolicyType policyType = PolicyType.COMPREHENSIVE;

    @NotNull
    @Column(nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private PolicyStatus status = PolicyStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.SUCCESS;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, updatable = false)
    private LocalDateTime purchasedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL)
    private Set<Claim> claims = new HashSet<>();

    // Optional admin plan applied to this policy
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_plan_id")
    private com.vehicleinsurance.entity.AdminPlan adminPlan;

    public enum PolicyStatus {
        ACTIVE,
        EXPIRED,
        CANCELLED
    }

    public enum PaymentStatus {
        INITIATED,
        PROCESSING,
        SUCCESS,
        FAILED
    }

    public enum PolicyType {
        COMPREHENSIVE,
        THIRD_PARTY
    }

    public enum PaymentMethod {
        UPI,
        CREDIT_DEBIT_CARD,
        NET_BANKING
    }
}

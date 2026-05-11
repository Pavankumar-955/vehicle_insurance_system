package com.vehicleinsurance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 30)
    private String claimNumber;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id", nullable = false)
    private Policy policy;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String claimDescription;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private SettlementType claimSettlementType = SettlementType.CASHLESS;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private ClaimStatus status = ClaimStatus.PENDING;

    @Size(max = 500)
    @Column(length = 500)
    private String adminRemark;

    @Column(nullable = false, updatable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();

    private LocalDateTime resolvedAt;

    @PostLoad // Lifecycle callback to set default values after loading entity
    public void postLoad() {
        // Default null settlement type to CASHLESS (for legacy claims)
        if (this.claimSettlementType == null) {
            this.claimSettlementType = SettlementType.CASHLESS;
        }
    }

    public enum ClaimStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    public enum SettlementType {
        CASHLESS,
        REIMBURSEMENT
    }
}

package com.vehicleinsurance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "insurance_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @NotNull
    @DecimalMin("0.01")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal premiumAmount;

    @NotNull
    @Column(nullable = false)
    private Integer coverageMonths;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Vehicle.VehicleType applicableVehicleType;

    @Column(nullable = false)
    private Boolean active = true;

    @OneToMany(mappedBy = "insurancePlan", cascade = CascadeType.ALL)
    private Set<Policy> policies = new HashSet<>();
}

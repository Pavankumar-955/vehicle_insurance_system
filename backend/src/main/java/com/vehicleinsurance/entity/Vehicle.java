package com.vehicleinsurance.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles", uniqueConstraints = {
    @UniqueConstraint(columnNames = "vehicleNumber")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, unique = true, length = 20)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private VehicleType vehicleType;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String brand;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String model;

    @NotNull
    @Positive // Year must be positive
    @Column(nullable = false)
    private Integer manufacturingYear;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Integer engineCC;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 12, scale = 2)
    private java.math.BigDecimal exShowroomPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public enum VehicleType {
        CAR,
        BIKE
    }
}

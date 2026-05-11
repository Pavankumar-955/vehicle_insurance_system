package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.Vehicle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {

    @NotBlank(message = "Vehicle number is required")
    @Size(max = 20)
    private String vehicleNumber;

    @NotNull(message = "Vehicle type is required")
    private Vehicle.VehicleType vehicleType;

    @NotBlank(message = "Brand is required")
    @Size(max = 50)
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(max = 50)
    private String model;

    @NotNull(message = "Manufacturing year is required")
    @Positive
    private Integer manufacturingYear;

    @NotNull(message = "Engine CC is required")
    @Positive(message = "Engine CC must be positive")
    private Integer engineCC;

    @NotNull(message = "Ex-showroom price is required")
    @Positive(message = "Ex-showroom price must be positive")
    private BigDecimal exShowroomPrice;
}

package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.Vehicle;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePlanRequest {

    @NotBlank(message = "Plan name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @NotNull(message = "Premium amount is required")
    @DecimalMin(value = "0.01", message = "Premium must be positive")
    private BigDecimal premiumAmount;

    @NotNull(message = "Coverage months is required")
    private Integer coverageMonths;

    private Vehicle.VehicleType applicableVehicleType;

    private Boolean active = true;
}

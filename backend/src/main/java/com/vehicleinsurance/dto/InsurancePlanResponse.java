package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePlanResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal premiumAmount;
    private Integer coverageMonths;
    private Vehicle.VehicleType applicableVehicleType;
    private Boolean active;
}

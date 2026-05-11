package com.vehicleinsurance.dto;

import com.vehicleinsurance.entity.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponse {

    private Long id;
    private String vehicleNumber;
    private Vehicle.VehicleType vehicleType;
    private String brand;
    private String model;
    private Integer manufacturingYear;
    private Integer engineCC;
    private BigDecimal exShowroomPrice;
}

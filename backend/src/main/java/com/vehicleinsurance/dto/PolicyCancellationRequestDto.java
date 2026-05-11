package com.vehicleinsurance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PolicyCancellationRequestDto {

    @NotBlank(message = "Reason for cancellation is required")
    @Size(min = 10, max = 500, message = "Reason must be between 10 and 500 characters")
    private String cancellationReason;
}


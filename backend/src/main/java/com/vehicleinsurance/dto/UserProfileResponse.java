package com.vehicleinsurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String dateOfBirth;
    private String addressLine;
    private String city;
    private String state;
    private String pincode;
}

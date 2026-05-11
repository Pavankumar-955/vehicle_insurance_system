package com.vehicleinsurance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;// JWT access token
    private String tokenType = "Bearer";// Type of the token
    private Long id;
    private String email;
    private String fullName;
    private Set<String> roles;
}

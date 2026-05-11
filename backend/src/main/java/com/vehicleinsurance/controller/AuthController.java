package com.vehicleinsurance.controller;

import com.vehicleinsurance.dto.AuthResponse;
import com.vehicleinsurance.dto.LoginRequest;
import com.vehicleinsurance.dto.RegisterRequest;
import com.vehicleinsurance.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController // Marks this class as a REST controller
@RequestMapping("/api/auth") // Base URL for all endpoints in this controller
@RequiredArgsConstructor // Injects final fields via constructor injection
public class AuthController {

    private final AuthService authService;// Service layer for authentication logic

    @PostMapping("/register") // Endpoint for user registration
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")// Endpoint for user login
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")// Endpoint to get current authenticated user details
    public ResponseEntity<AuthResponse> getCurrentUser() {
        var user = authService.getCurrentUser();
        var roles = user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet());
        AuthResponse res = new AuthResponse(null, "Bearer", user.getId(), user.getEmail(), user.getFullName(), roles);
        return ResponseEntity.ok(res);
    }
}

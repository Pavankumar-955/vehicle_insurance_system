package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.*;
import com.vehicleinsurance.entity.Role;
import com.vehicleinsurance.entity.User;
import com.vehicleinsurance.exception.BadRequestException;
import com.vehicleinsurance.repository.RoleRepository;
import com.vehicleinsurance.repository.UserRepository;
import com.vehicleinsurance.security.JwtTokenProvider;
import com.vehicleinsurance.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setMobileNumber(request.getMobileNumber());
        
        // Parse and set date of birth
        try {
            java.time.LocalDate dateOfBirth = java.time.LocalDate.parse(request.getDateOfBirth());
            if (dateOfBirth.isAfter(java.time.LocalDate.now())) {
                throw new BadRequestException("Date of birth cannot be in the future");
            }
            if (dateOfBirth.isAfter(java.time.LocalDate.now().minusYears(18))) {
                throw new BadRequestException("User must be at least 18 years old");
            }
            user.setDateOfBirth(dateOfBirth);
        } catch (java.time.format.DateTimeParseException e) {
            throw new BadRequestException("Invalid date format. Use yyyy-MM-dd");
        }

        Set<Role> roles = new HashSet<>();
        Role customerRole = roleRepository.findByName(Role.RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new BadRequestException("Customer role not found. Run data.sql to seed roles."));
        roles.add(customerRole);
        user.setRoles(roles);

        user = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        return buildAuthResponse(authentication, user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return buildAuthResponse(authentication, user);
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new BadRequestException("User not authenticated");
        }
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private AuthResponse buildAuthResponse(Authentication authentication, User user) {
        String token = tokenProvider.generateToken(authentication);
        Set<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toSet());
        return new AuthResponse(token, "Bearer", user.getId(), user.getEmail(), user.getFullName(), roles);
    }
}

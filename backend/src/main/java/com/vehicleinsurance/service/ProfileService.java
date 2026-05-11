package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.UserProfileRequest;
import com.vehicleinsurance.dto.UserProfileResponse;
import com.vehicleinsurance.entity.User;
import com.vehicleinsurance.exception.BadRequestException;
import com.vehicleinsurance.exception.ResourceNotFoundException;
import com.vehicleinsurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile() {
        User user = authService.getCurrentUser();
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateMyProfile(UserProfileRequest request) {
        User user = authService.getCurrentUser();

        // Validate mobile number format
        if (!request.getMobileNumber().matches("^[6-9]\\d{9}$")) {
            throw new BadRequestException("Mobile number must start with 6-9 and be 10 digits");
        }

        // Validate pincode format
        if (!request.getPincode().matches("^\\d{6}$")) {
            throw new BadRequestException("Pincode must be 6 digits");
        }

        // Parse and validate date of birth
        LocalDate dateOfBirth;
        try {
            dateOfBirth = LocalDate.parse(request.getDateOfBirth(), DATE_FORMATTER);
            if (dateOfBirth.isAfter(LocalDate.now())) {
                throw new BadRequestException("Date of birth cannot be in the future");
            }
            if (dateOfBirth.isAfter(LocalDate.now().minusYears(18))) {
                throw new BadRequestException("User must be at least 18 years old");
            }
        } catch (DateTimeParseException e) {
            throw new BadRequestException("Invalid date format. Use yyyy-MM-dd");
        }

        // Update profile fields
        user.setMobileNumber(request.getMobileNumber());
        user.setDateOfBirth(dateOfBirth);
        user.setAddressLine(request.getAddressLine());
        user.setCity(request.getCity());
        user.setState(request.getState());
        user.setPincode(request.getPincode());

        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private UserProfileResponse toResponse(User user) {
        String dateOfBirthStr = user.getDateOfBirth() != null
                ? user.getDateOfBirth().format(DATE_FORMATTER)
                : null;

        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getMobileNumber(),
                dateOfBirthStr,
                user.getAddressLine(),
                user.getCity(),
                user.getState(),
                user.getPincode()
        );
    }
}

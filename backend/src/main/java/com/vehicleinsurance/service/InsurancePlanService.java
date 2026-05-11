package com.vehicleinsurance.service;

import com.vehicleinsurance.entity.InsurancePlan;
import com.vehicleinsurance.exception.ResourceNotFoundException;
import com.vehicleinsurance.repository.InsurancePlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InsurancePlanService {

    private final InsurancePlanRepository planRepository;

    public InsurancePlan getEntity(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InsurancePlan", "id", id));
    }
}

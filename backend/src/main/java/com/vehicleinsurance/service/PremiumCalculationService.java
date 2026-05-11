package com.vehicleinsurance.service;

import com.vehicleinsurance.dto.PremiumBreakupResponse;
import com.vehicleinsurance.entity.Vehicle;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import com.vehicleinsurance.entity.AdminPlan;

@Service
@RequiredArgsConstructor
public class PremiumCalculationService {

    /**
     * Calculate premium breakup based on vehicle details and policy type
     * 
     * CALCULATION LOGIC (INDIA-REALISTIC):
     * 1. Vehicle Age: age = currentYear - manufacturingYear
     * 2. Depreciation (ONLY for COMPREHENSIVE):
     *    age <= 1  → 5%
     *    age <= 2  → 15%
     *    age <= 3  → 20%
     *    age <= 4  → 30%
     *    age <= 5  → 40%
     *    else      → 50%
     * 3. IDV (ONLY for COMPREHENSIVE): idv = exShowroomPrice - (exShowroomPrice * depreciation%)
     * 4. Third Party Premium (ALWAYS calculated)
     * 5. Own Damage Premium (ONLY for COMPREHENSIVE): ownDamage = idv * 0.02
     * 6. GST: gst = (thirdParty + ownDamage) * 0.18
     * 7. Total Premium: totalPremium = thirdParty + ownDamage + gst
     */
    public PremiumBreakupResponse calculatePremium(Vehicle vehicle, String policyType) {
        int currentYear = LocalDate.now().getYear();// Get current year
        int vehicleAge = currentYear - vehicle.getManufacturingYear();

        // Ensure vehicle age is not negative
        vehicleAge = Math.max(0, vehicleAge);

        // Calculate depreciation (only for COMPREHENSIVE)
        BigDecimal depreciationPercent = BigDecimal.ZERO;// Default 0%
        BigDecimal idv = null;
        BigDecimal ownDamagePremium = BigDecimal.ZERO;

        if ("COMPREHENSIVE".equalsIgnoreCase(policyType)) {
            depreciationPercent = getDepreciationPercent(vehicleAge);
            
            // Calculate IDV: idv = exShowroomPrice - (exShowroomPrice * depreciation%)
            BigDecimal depreciationAmount = vehicle.getExShowroomPrice()
                    .multiply(depreciationPercent)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            
            idv = vehicle.getExShowroomPrice().subtract(depreciationAmount).max(BigDecimal.ZERO);

            // Own damage premium = IDV * 0.02 (2%)
            ownDamagePremium = idv.multiply(new BigDecimal("0.02")).setScale(2, RoundingMode.HALF_UP);
        }

        // Calculate Third-party premium (ALWAYS calculated)
        BigDecimal thirdPartyPremium = calculateThirdPartyPremium(vehicle.getVehicleType(), vehicle.getEngineCC());

        // Calculate subtotal (OD + TP)
        BigDecimal subtotal = ownDamagePremium.add(thirdPartyPremium);

        // Calculate GST (18%)
        BigDecimal gst = subtotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);

        // Calculate total premium
        BigDecimal totalPremium = subtotal.add(gst).setScale(2, RoundingMode.HALF_UP);

        PremiumBreakupResponse base = new PremiumBreakupResponse(
                policyType,
                vehicleAge,
                "COMPREHENSIVE".equalsIgnoreCase(policyType) ? depreciationPercent : null,
                idv,
                ownDamagePremium,
                thirdPartyPremium,
                gst,
                totalPremium
        );

        // finalPremium defaults to base totalPremium when no admin plan applied
        base.setFinalPremium(totalPremium);
        return base;
    }

    /**
     * Calculate premium with optional AdminPlan applied on top of base premium
     */
    public PremiumBreakupResponse calculatePremium(Vehicle vehicle, String policyType, AdminPlan adminPlan) {
        PremiumBreakupResponse base = calculatePremium(vehicle, policyType);

        if (adminPlan == null) return base;

        // Only apply if plan is active and matches policy type
        if (!adminPlan.isActive()) return base;
        if (!adminPlan.getPolicyType().name().equalsIgnoreCase(policyType)) return base;

        Integer engineCC = vehicle.getEngineCC();
        if (adminPlan.getMinEngineCC() != null && engineCC != null && engineCC < adminPlan.getMinEngineCC()) return base;
        if (adminPlan.getMaxEngineCC() != null && engineCC != null && engineCC > adminPlan.getMaxEngineCC()) return base;

        java.math.BigDecimal extraAmount = adminPlan.getExtraAmount() == null ? BigDecimal.ZERO : adminPlan.getExtraAmount();
        java.math.BigDecimal extraPercentage = adminPlan.getExtraPercentage() == null ? BigDecimal.ZERO : adminPlan.getExtraPercentage();

        BigDecimal baseTotal = base.getTotalPremium() == null ? BigDecimal.ZERO : base.getTotalPremium();
        BigDecimal percentAdd = baseTotal.multiply(extraPercentage).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        BigDecimal finalPremium = baseTotal.add(extraAmount == null ? BigDecimal.ZERO : extraAmount).add(percentAdd).setScale(2, RoundingMode.HALF_UP);

        base.setAdminPlanName(adminPlan.getPlanName());
        base.setAdminExtraAmount(extraAmount);
        base.setAdminExtraPercentage(extraPercentage);
        base.setFinalPremium(finalPremium);

        return base;
    }

    /**
     * Get depreciation percentage based on vehicle age (INDIA-REALISTIC)
     * age <= 1  → 5%
     * age <= 2  → 15%
     * age <= 3  → 20%
     * age <= 4  → 30%
     * age <= 5  → 40%
     * else      → 50%
     */
    private BigDecimal getDepreciationPercent(int vehicleAge) {
        if (vehicleAge <= 1) {
            return new BigDecimal("5"); // big decimal is for storing exact decimal repesentation and avoidance of rounding errors
        } else if (vehicleAge <= 2) {
            return new BigDecimal("15");
        } else if (vehicleAge <= 3) {
            return new BigDecimal("20");
        } else if (vehicleAge <= 4) {
            return new BigDecimal("30");
        } else if (vehicleAge <= 5) {
            return new BigDecimal("40");
        } else {
            return new BigDecimal("50");
        }
    }

    /**
     * Calculate Third-party premium based on vehicle type and engineCC (INDIA-REALISTIC)
     * 
     * CAR:
     *   engineCC <= 1000        → 2094
     *   engineCC <= 1500        → 3416
     *   else                    → 7897
     * 
     * BIKE:
     *   engineCC <= 75          → 538
     *   engineCC <= 150         → 714
     *   else                    → 1366
     */
    private BigDecimal calculateThirdPartyPremium(Vehicle.VehicleType vehicleType, Integer engineCC) {
        if (engineCC == null || engineCC <= 0) {
            engineCC = 1000;
        }

        if (vehicleType == Vehicle.VehicleType.CAR) {
            if (engineCC <= 1000) {
                return new BigDecimal("2094.00");
            } else if (engineCC <= 1500) {
                return new BigDecimal("3416.00");
            } else {
                return new BigDecimal("7897.00");
            }
        } else if (vehicleType == Vehicle.VehicleType.BIKE) {
            if (engineCC <= 75) {
                return new BigDecimal("538.00");
            } else if (engineCC <= 150) {
                return new BigDecimal("714.00");
            } else {
                return new BigDecimal("1366.00");
            }
        }

        // Default fallback
        return new BigDecimal("2094.00");
    }
}

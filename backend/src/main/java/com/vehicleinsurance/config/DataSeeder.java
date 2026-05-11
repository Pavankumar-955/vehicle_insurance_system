package com.vehicleinsurance.config;

// import com.vehicleinsurance.entity.InsurancePlan;
import com.vehicleinsurance.entity.Role;
import com.vehicleinsurance.entity.User;
// import com.vehicleinsurance.entity.Vehicle;
// import com.vehicleinsurance.repository.InsurancePlanRepository;
import com.vehicleinsurance.repository.RoleRepository;
import com.vehicleinsurance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

// import java.math.BigDecimal;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    // private final InsurancePlanRepository planRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (roleRepository.count() > 0) return;

        Role adminRole = new Role();
        adminRole.setName(Role.RoleName.ROLE_ADMIN);
        adminRole = roleRepository.save(adminRole);

        Role customerRole = new Role();
        customerRole.setName(Role.RoleName.ROLE_CUSTOMER);
        customerRole = roleRepository.save(customerRole);

        if (!userRepository.existsByEmail("admin@vehicleinsurance.com")) {
            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail("admin@vehicleinsurance.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setPhone("9999999999");
            admin.setRoles(Set.of(adminRole));
            userRepository.save(admin);
        }


    }
}

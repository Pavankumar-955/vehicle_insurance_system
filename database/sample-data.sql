-- Sample data (optional – DataSeeder creates roles, admin, and plans on first run)
-- Use this only if you want to pre-fill or reset with extra sample data.

USE vehicle_insurance_db;

-- Roles (if not already created by app)
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_CUSTOMER');

-- Admin user (password: admin123) – only if not exists. BCrypt hash for 'admin123'
-- INSERT IGNORE INTO users (full_name, email, password, phone) VALUES
--   ('System Admin', 'admin@vehicleinsurance.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqgJH8oKrlK.lqVdEIQqKbYq3HyOi', '9999999999');
-- INSERT IGNORE INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.email='admin@vehicleinsurance.com' AND r.name='ROLE_ADMIN';

-- Sample insurance plans (if plan table is empty)
INSERT IGNORE INTO insurance_plans (name, description, premium_amount, coverage_months, applicable_vehicle_type, active) VALUES
  ('Basic Car', 'Essential coverage for cars. 12 months.', 5000.00, 12, 'CAR', TRUE),
  ('Comprehensive Car', 'Full coverage for cars. 12 months.', 12000.00, 12, 'CAR', TRUE),
  ('Basic Bike', 'Essential coverage for bikes. 12 months.', 1500.00, 12, 'BIKE', TRUE),
  ('Comprehensive Bike', 'Full coverage for bikes. 12 months.', 3500.00, 12, 'BIKE', TRUE);

-- Sample customer (password: cust123) – for manual testing. BCrypt for 'cust123'
-- INSERT IGNORE INTO users (full_name, email, password, phone) VALUES
--   ('John Doe', 'john@example.com', '$2a$10$xyz...', '9876543210');
-- INSERT IGNORE INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u, roles r WHERE u.email='john@example.com' AND r.name='ROLE_CUSTOMER';

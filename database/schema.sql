-- Vehicle Insurance DB - Schema (optional: JPA ddl-auto=update creates tables automatically)
-- Use this for reference or to create DB manually

CREATE DATABASE IF NOT EXISTS vehicle_insurance_db;
USE vehicle_insurance_db;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE
);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(120) NOT NULL,
  phone VARCHAR(20)
);

-- User-Role (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  vehicle_number VARCHAR(20) NOT NULL UNIQUE,
  vehicle_type VARCHAR(20) NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(50) NOT NULL,
  manufacturing_year INT NOT NULL,
  engine_cc INT NOT NULL,
  ex_showroom_price DECIMAL(12,2) NOT NULL,
  user_id BIGINT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insurance Plans
CREATE TABLE IF NOT EXISTS insurance_plans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  premium_amount DECIMAL(10,2) NOT NULL,
  coverage_months INT NOT NULL,
  applicable_vehicle_type VARCHAR(20),
  active BOOLEAN DEFAULT TRUE
);

-- Policies
CREATE TABLE IF NOT EXISTS policies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  policy_number VARCHAR(30) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  vehicle_id BIGINT NOT NULL,
  insurance_plan_id BIGINT NOT NULL,
  premium_amount DECIMAL(10,2) NOT NULL,
  policy_type VARCHAR(20) NOT NULL DEFAULT 'COMPREHENSIVE',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  payment_status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
  purchased_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (insurance_plan_id) REFERENCES insurance_plans(id),
  INDEX idx_user_vehicle (user_id, vehicle_id),
  INDEX idx_user_id (user_id),
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_status (status)
);

-- Claims
CREATE TABLE IF NOT EXISTS claims (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  claim_number VARCHAR(30) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  policy_id BIGINT NOT NULL,
  claim_description VARCHAR(500) NOT NULL,
  claim_settlement_type VARCHAR(20) NOT NULL DEFAULT 'CASHLESS',
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  admin_remark VARCHAR(500),
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (policy_id) REFERENCES policies(id) ON DELETE CASCADE
);

-- Tickets (Support System)
CREATE TABLE IF NOT EXISTS tickets (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(30) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL,
  category VARCHAR(50) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  description VARCHAR(2000) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  last_reply_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Ticket Replies
CREATE TABLE IF NOT EXISTS ticket_replies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  message VARCHAR(2000) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_created_at (created_at)
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(50) NOT NULL,
  related_entity_id BIGINT,
  related_entity_type VARCHAR(50),
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_document_type (document_type),
  INDEX idx_related_entity (related_entity_id, related_entity_type),
  INDEX idx_uploaded_at (uploaded_at)
);

-- Drop the unique constraint on policies table if it exists
USE vehicle_insurance_db;

-- Get the constraint name and drop it
ALTER TABLE policies DROP INDEX UK24kftcmnscen40lan8t095ir6;

-- Verify the table structure
DESC policies;

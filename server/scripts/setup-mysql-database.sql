-- Quick setup script for MySQL database
-- Run this first if you haven't created the database yet

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS report 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE report;

-- Show confirmation
SELECT 'Database "report" is ready!' AS Status;
SELECT DATABASE() AS 'Current Database';

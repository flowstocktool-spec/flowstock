
-- Migration: Add Gmail credentials to users table
-- Created: 2024-01-01

ALTER TABLE users ADD COLUMN gmail_username TEXT;
ALTER TABLE users ADD COLUMN gmail_app_password TEXT;

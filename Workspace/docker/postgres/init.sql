-- PostgreSQL initialization script
-- Runs once when the container is first created

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing utilities
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable citext for case-insensitive text (email addresses)
CREATE EXTENSION IF NOT EXISTS "citext";

-- Log that init completed
DO $$
BEGIN
  RAISE NOTICE 'WorkSphere database initialized successfully';
END $$;

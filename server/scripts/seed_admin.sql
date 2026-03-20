-- Seed an initial admin user
-- Replace the plaintext password and email before running.

-- bcrypt hash for password 'Olvet123@' (cost 10) — REPLACE if you change password
-- WARNING: Do not store plaintext passwords. Only the hash is inserted.

-- Requires pgcrypto extension: CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO users (fullname, email, password, role, country, contact, address)
VALUES (
  'Admin User',
  'olvet@gmail.com',
  crypt('Olvet123@', gen_salt('bf', 10)),
  'admin',
  NULL,
  NULL,
  NULL
)
ON CONFLICT (email) DO NOTHING;

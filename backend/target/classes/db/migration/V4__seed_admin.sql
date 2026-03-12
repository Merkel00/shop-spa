INSERT INTO users (email, password_hash, role)
VALUES ('admin@shop.local', '$2a$10$REPLACE_WITH_BCRYPT_HASH', 'admin')
ON CONFLICT (email) DO NOTHING;
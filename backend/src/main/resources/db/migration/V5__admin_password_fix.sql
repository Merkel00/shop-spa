INSERT INTO users (email, password_hash, role)
VALUES (
  'admin@shop.local',
  '$2a$10$4xFS2iHaq73tlaeksdzTRes6Px7chm7BiaAhG9b1/9c2Yj1w55MDy',
  'admin'
)
ON CONFLICT (email)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;
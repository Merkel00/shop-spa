INSERT INTO promo_codes (code, discount_percent, is_active)
VALUES
  ('SALE10', 10.00, TRUE),
  ('WELCOME5', 5.00, TRUE)
ON CONFLICT (code) DO NOTHING;
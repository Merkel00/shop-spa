CREATE TABLE IF NOT EXISTS categories (
  id          BIGSERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS category_id BIGINT REFERENCES categories(id);


CREATE TABLE IF NOT EXISTS addresses (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  street     VARCHAR(255) NOT NULL,
  city       VARCHAR(120) NOT NULL,
  postal_code VARCHAR(30),
  country    VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
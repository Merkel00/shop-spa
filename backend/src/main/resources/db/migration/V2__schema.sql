
CREATE TABLE IF NOT EXISTS users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(50)  NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS products (
  id             BIGSERIAL PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  description    TEXT,
  price          NUMERIC(12,2) NOT NULL,
  image_url      TEXT,
  category       VARCHAR(120),
  brand          VARCHAR(120),
  rating         NUMERIC(3,2),
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS orders (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users(id),
  status           VARCHAR(50) NOT NULL,
  subtotal         NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount         NUMERIC(12,2) NOT NULL DEFAULT 0,
  total            NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_address TEXT,
  created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS order_items (
  id                    BIGSERIAL PRIMARY KEY,
  order_id              BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id            BIGINT REFERENCES products(id),
  product_title_snapshot VARCHAR(255) NOT NULL,
  unit_price_snapshot   NUMERIC(12,2) NOT NULL,
  quantity              INT NOT NULL,
  line_total            NUMERIC(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
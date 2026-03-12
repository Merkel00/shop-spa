create table if not exists carts (
  id bigserial primary key,
  user_id bigint not null unique,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists cart_items (
  id bigserial primary key,
  cart_id bigint not null references carts(id) on delete cascade,
  product_id bigint not null references products(id),
  quantity integer not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint uq_cart_items_cart_product unique (cart_id, product_id),
  constraint chk_cart_items_quantity_positive check (quantity > 0)
);
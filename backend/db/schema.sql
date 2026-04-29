CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY,
  public_id TEXT NOT NULL UNIQUE,
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  printify_order_id TEXT UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'pending',
  printify_status TEXT,
  promo_code TEXT,
  currency TEXT NOT NULL,
  subtotal_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  shipping_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  shipping_method INTEGER NOT NULL DEFAULT 1,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_country TEXT NOT NULL,
  shipping_region TEXT,
  shipping_city TEXT NOT NULL,
  shipping_zip TEXT NOT NULL,
  shipping_address1 TEXT NOT NULL,
  shipping_address2 TEXT,
  stripe_checkout_url TEXT,
  printify_response JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  variant_id BIGINT NOT NULL,
  sku TEXT,
  product_title TEXT NOT NULL,
  variant_title TEXT NOT NULL,
  option_color TEXT,
  option_size TEXT,
  image_url TEXT,
  quantity INTEGER NOT NULL,
  unit_amount INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_public_id ON orders(public_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session_id ON orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_printify_order_id ON orders(printify_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS promo_codes (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
  max_redemptions INTEGER NOT NULL DEFAULT 1,
  redemptions_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  reserved_by_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  reserved_until TIMESTAMPTZ,
  redeemed_by_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_reserved_until ON promo_codes(reserved_until);

CREATE TABLE IF NOT EXISTS promo_code_claims (
  id UUID PRIMARY KEY,
  promo_code_id BIGINT NOT NULL UNIQUE REFERENCES promo_codes(id) ON DELETE CASCADE,
  client_token TEXT NOT NULL,
  discount_percent INTEGER NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promo_code_claims_client_token ON promo_code_claims(client_token);
CREATE INDEX IF NOT EXISTS idx_promo_code_claims_valid_until ON promo_code_claims(valid_until);

DELETE FROM promo_codes
WHERE code IN ('ALMA26ZX09', 'YXASWD206', 'ALEKSEYPRODUCTION');

INSERT INTO promo_codes (code, discount_percent)
VALUES
  ('DRIP15', 15),
  ('STREET15', 15),
  ('HOOD15', 15),
  ('STYLE15', 15),
  ('FLEX15', 15),
  ('URBAN15', 15),
  ('WAVE15', 15),
  ('CAP15', 15),
  ('VIBE15', 15),
  ('DROP15', 15),
  ('SAVE10', 10),
  ('MERCH10', 10),
  ('FIT10', 10),
  ('SWAG10', 10),
  ('LOOK10', 10),
  ('BASIC10', 10),
  ('DAILY10', 10),
  ('STREET10', 10),
  ('COOL10', 10),
  ('STYLE10', 10),
  ('MINI5', 5),
  ('TRY5', 5),
  ('START5', 5),
  ('NEW5', 5),
  ('HELLO5', 5),
  ('CAP5', 5),
  ('FIT5', 5),
  ('EASY5', 5),
  ('SMALL5', 5),
  ('QUICK5', 5)
ON CONFLICT (code) DO NOTHING;

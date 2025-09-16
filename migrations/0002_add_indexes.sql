
-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_user_sku ON products(user_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_user_stock ON products(user_id, stock);
CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_reports_user_id ON stock_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_product_id ON product_suppliers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_supplier_id ON product_suppliers(supplier_id);

-- Add unique constraint for user email if not exists
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE (email);

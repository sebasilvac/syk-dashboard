-- ===========================
-- Row Level Security Policies
-- ===========================

-- Helper function to read user role from JWT metadata
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    ''
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ===========================
-- Enable RLS on all tables
-- ===========================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;

-- ===========================
-- Admin: full access to everything
-- ===========================
CREATE POLICY admin_all ON clients FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY admin_all ON products FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY admin_all ON variants FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY admin_all ON quotations FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY admin_all ON quotation_lines FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY admin_all ON orders FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY admin_all ON order_lines FOR ALL USING (get_user_role() = 'admin');
CREATE POLICY admin_all ON deposits FOR ALL USING (get_user_role() = 'admin');

-- ===========================
-- Clients: all authenticated can read and write (except delete)
-- ===========================
CREATE POLICY clients_select ON clients FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY clients_insert ON clients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY clients_update ON clients FOR UPDATE USING (auth.uid() IS NOT NULL);
-- Only admin can delete clients (handled by admin_all policy above)

-- ===========================
-- Products & Variants: all authenticated can read
-- ===========================
CREATE POLICY products_select ON products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY variants_select ON variants FOR SELECT USING (auth.uid() IS NOT NULL);

-- ===========================
-- Quotations: vendedor scoped by seller_id
-- ===========================
CREATE POLICY quotations_select_vendedor ON quotations
  FOR SELECT USING (get_user_role() = 'vendedor' AND seller_id = auth.uid());
CREATE POLICY quotations_insert_vendedor ON quotations
  FOR INSERT WITH CHECK (get_user_role() = 'vendedor' AND seller_id = auth.uid());
CREATE POLICY quotations_update_vendedor ON quotations
  FOR UPDATE USING (get_user_role() = 'vendedor' AND seller_id = auth.uid());

-- ===========================
-- Quotation lines: accessible if parent quotation is accessible
-- ===========================
CREATE POLICY quotation_lines_select ON quotation_lines
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_id
      AND (get_user_role() = 'admin' OR q.seller_id = auth.uid()))
  );
CREATE POLICY quotation_lines_insert ON quotation_lines
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_id
      AND (get_user_role() = 'admin' OR q.seller_id = auth.uid()))
  );
CREATE POLICY quotation_lines_update ON quotation_lines
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_id
      AND (get_user_role() = 'admin' OR q.seller_id = auth.uid()))
  );
CREATE POLICY quotation_lines_delete ON quotation_lines
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM quotations q WHERE q.id = quotation_id
      AND (get_user_role() = 'admin' OR q.seller_id = auth.uid()))
  );

-- ===========================
-- Orders: vendedor scoped by seller_id
-- ===========================
CREATE POLICY orders_select_vendedor ON orders
  FOR SELECT USING (get_user_role() = 'vendedor' AND seller_id = auth.uid());
CREATE POLICY orders_insert_vendedor ON orders
  FOR INSERT WITH CHECK (get_user_role() = 'vendedor' AND seller_id = auth.uid());
CREATE POLICY orders_update_vendedor ON orders
  FOR UPDATE USING (get_user_role() = 'vendedor' AND seller_id = auth.uid());

-- ===========================
-- Order lines: accessible if parent order is accessible
-- ===========================
CREATE POLICY order_lines_select ON order_lines
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id
      AND (get_user_role() = 'admin' OR o.seller_id = auth.uid()))
  );
CREATE POLICY order_lines_insert ON order_lines
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id
      AND (get_user_role() = 'admin' OR o.seller_id = auth.uid()))
  );
CREATE POLICY order_lines_update ON order_lines
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id
      AND (get_user_role() = 'admin' OR o.seller_id = auth.uid()))
  );
CREATE POLICY order_lines_delete ON order_lines
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id
      AND (get_user_role() = 'admin' OR o.seller_id = auth.uid()))
  );

-- ===========================
-- Deposits: accessible if parent order is accessible
-- ===========================
CREATE POLICY deposits_select ON deposits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id
      AND (get_user_role() = 'admin' OR o.seller_id = auth.uid()))
  );
CREATE POLICY deposits_insert ON deposits
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id
      AND (get_user_role() = 'admin' OR o.seller_id = auth.uid()))
  );
CREATE POLICY deposits_delete ON deposits
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id
      AND (get_user_role() = 'admin' OR o.seller_id = auth.uid()))
  );

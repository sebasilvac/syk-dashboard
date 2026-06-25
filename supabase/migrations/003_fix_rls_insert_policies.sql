-- ===========================
-- Fix RLS policies for INSERT operations
-- ===========================
-- Root cause: get_user_role() returns '' when role is not set in user_metadata,
-- causing ALL insert policies to deny access since no policy matches.
--
-- Solution:
-- 1. Update get_user_role() to check both user_metadata AND app_metadata
-- 2. Add permissive INSERT policies that allow any authenticated user
--    to insert their own records (seller_id = auth.uid()) regardless of role
-- 3. Add explicit WITH CHECK to admin FOR ALL policies

-- ===========================
-- Step 1: Update helper function to check both metadata locations
-- ===========================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT coalesce(
    nullif(auth.jwt() -> 'user_metadata' ->> 'role', ''),
    nullif(auth.jwt() -> 'app_metadata' ->> 'role', ''),
    nullif(current_setting('request.jwt.claims', true)::json -> 'user_metadata' ->> 'role', ''),
    ''
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- ===========================
-- Step 2: Drop old admin policies and recreate with WITH CHECK
-- ===========================
DROP POLICY IF EXISTS admin_all ON clients;
DROP POLICY IF EXISTS admin_all ON products;
DROP POLICY IF EXISTS admin_all ON variants;
DROP POLICY IF EXISTS admin_all ON quotations;
DROP POLICY IF EXISTS admin_all ON quotation_lines;
DROP POLICY IF EXISTS admin_all ON orders;
DROP POLICY IF EXISTS admin_all ON order_lines;
DROP POLICY IF EXISTS admin_all ON deposits;

CREATE POLICY admin_all ON clients FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY admin_all ON products FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY admin_all ON variants FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY admin_all ON quotations FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY admin_all ON quotation_lines FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY admin_all ON orders FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY admin_all ON order_lines FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY admin_all ON deposits FOR ALL
  USING (get_user_role() = 'admin')
  WITH CHECK (get_user_role() = 'admin');

-- ===========================
-- Step 3: Add fallback INSERT policies for authenticated users
-- These ensure that even if role metadata is missing, a user can still
-- insert records where seller_id matches their own auth.uid().
-- (PERMISSIVE policies — only one needs to pass)
-- ===========================

-- Quotations: any authenticated user can insert their own quotations
DROP POLICY IF EXISTS quotations_insert_own ON quotations;
CREATE POLICY quotations_insert_own ON quotations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND seller_id = auth.uid());

-- Orders: any authenticated user can insert their own orders
DROP POLICY IF EXISTS orders_insert_own ON orders;
CREATE POLICY orders_insert_own ON orders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND seller_id = auth.uid());

-- Quotation lines: any authenticated user can insert lines for their own quotations
DROP POLICY IF EXISTS quotation_lines_insert_own ON quotation_lines;
CREATE POLICY quotation_lines_insert_own ON quotation_lines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM quotations q
      WHERE q.id = quotation_id AND q.seller_id = auth.uid()
    )
  );

-- Order lines: any authenticated user can insert lines for their own orders
DROP POLICY IF EXISTS order_lines_insert_own ON order_lines;
CREATE POLICY order_lines_insert_own ON order_lines
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.seller_id = auth.uid()
    )
  );

-- Deposits: any authenticated user can insert deposits for their own orders
DROP POLICY IF EXISTS deposits_insert_own ON deposits;
CREATE POLICY deposits_insert_own ON deposits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.seller_id = auth.uid()
    )
  );

-- Clients: any authenticated user can insert clients
DROP POLICY IF EXISTS clients_insert ON clients;
CREATE POLICY clients_insert ON clients
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Products: only admin can insert (already covered by admin_all)
-- Variants: only admin can insert (already covered by admin_all)

-- ============================================================================
-- Seed Data for syk-dashboard
-- Equivalent SQL INSERT statements converted from src/lib/mockData.ts
-- Uses deterministic UUIDs to preserve relationships between entities.
-- ============================================================================

-- ===========================
-- Auth Users (inserted via Supabase Auth admin API in practice,
-- but we define the UUIDs here for foreign key references)
-- NOTE: In production, create these users via Supabase Dashboard or Auth API.
-- The UUIDs below must match the auth.users entries.
-- ===========================
-- user-1: Carolina Méndez (admin)  → 00000000-0000-0000-0000-000000000001
-- user-2: Luis Herrera (vendedor)  → 00000000-0000-0000-0000-000000000002

-- ===========================
-- Clients
-- ===========================
INSERT INTO clients (id, name, email, phone) VALUES
  ('11111111-1111-1111-1111-111111111001', 'Boutique La Moderna', 'compras@lamoderna.cl', '+56 9 8765 4321'),
  ('11111111-1111-1111-1111-111111111002', 'Tienda Estilo Urbano', 'pedidos@estilourbano.cl', '+56 9 1234 5678'),
  ('11111111-1111-1111-1111-111111111003', 'Distribuidora Moda Sur', 'contacto@modasur.cl', '+56 9 5555 3333');

-- ===========================
-- Products
-- ===========================
INSERT INTO products (id, name, category) VALUES
  ('22222222-2222-2222-2222-222222222001', 'Polera Básica Algodón', 'Poleras'),
  ('22222222-2222-2222-2222-222222222002', 'Jeans Slim Fit', 'Pantalones'),
  ('22222222-2222-2222-2222-222222222003', 'Chaqueta Denim Oversize', 'Chaquetas'),
  ('22222222-2222-2222-2222-222222222004', 'Vestido Midi Floral', 'Vestidos'),
  ('22222222-2222-2222-2222-222222222005', 'Falda Plisada', 'Faldas');

-- ===========================
-- Variants
-- ===========================
-- Product 1: Polera Básica Algodón
INSERT INTO variants (id, product_id, size, color, stock, min_stock) VALUES
  ('33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222001', 'S', 'Blanco', 25, 10),
  ('33333333-3333-3333-3333-333333333002', '22222222-2222-2222-2222-222222222001', 'M', 'Blanco', 30, 10),
  ('33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222001', 'L', 'Negro', 8, 10),
  ('33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222001', 'XL', 'Negro', 15, 10);

-- Product 2: Jeans Slim Fit
INSERT INTO variants (id, product_id, size, color, stock, min_stock) VALUES
  ('33333333-3333-3333-3333-333333333005', '22222222-2222-2222-2222-222222222002', '28', 'Azul Oscuro', 12, 5),
  ('33333333-3333-3333-3333-333333333006', '22222222-2222-2222-2222-222222222002', '30', 'Azul Oscuro', 18, 5),
  ('33333333-3333-3333-3333-333333333007', '22222222-2222-2222-2222-222222222002', '32', 'Negro', 10, 5);

-- Product 3: Chaqueta Denim Oversize
INSERT INTO variants (id, product_id, size, color, stock, min_stock) VALUES
  ('33333333-3333-3333-3333-333333333008', '22222222-2222-2222-2222-222222222003', 'M', 'Azul Claro', 6, 4),
  ('33333333-3333-3333-3333-333333333009', '22222222-2222-2222-2222-222222222003', 'L', 'Azul Claro', 9, 4),
  ('33333333-3333-3333-3333-333333333010', '22222222-2222-2222-2222-222222222003', 'L', 'Negro', 3, 4);

-- Product 4: Vestido Midi Floral
INSERT INTO variants (id, product_id, size, color, stock, min_stock) VALUES
  ('33333333-3333-3333-3333-333333333011', '22222222-2222-2222-2222-222222222004', 'S', 'Rosa', 14, 5),
  ('33333333-3333-3333-3333-333333333012', '22222222-2222-2222-2222-222222222004', 'M', 'Rosa', 20, 5),
  ('33333333-3333-3333-3333-333333333013', '22222222-2222-2222-2222-222222222004', 'M', 'Celeste', 11, 5),
  ('33333333-3333-3333-3333-333333333014', '22222222-2222-2222-2222-222222222004', 'L', 'Celeste', 7, 5);

-- Product 5: Falda Plisada
INSERT INTO variants (id, product_id, size, color, stock, min_stock) VALUES
  ('33333333-3333-3333-3333-333333333015', '22222222-2222-2222-2222-222222222005', 'S', 'Negro', 16, 8),
  ('33333333-3333-3333-3333-333333333016', '22222222-2222-2222-2222-222222222005', 'M', 'Negro', 22, 8),
  ('33333333-3333-3333-3333-333333333017', '22222222-2222-2222-2222-222222222005', 'M', 'Beige', 5, 8);

-- ===========================
-- Quotations
-- ===========================
INSERT INTO quotations (id, number, client_id, seller_id, total, status, notes, estimated_delivery_date, created_at, updated_at) VALUES
  ('44444444-4444-4444-4444-444444444001', 'COT-001', '11111111-1111-1111-1111-111111111001', '00000000-0000-0000-0000-000000000002', 212500.00, 'pendiente', 'Entrega solicitada para fin de mes.', (CURRENT_DATE + INTERVAL '14 days')::DATE, now() - INTERVAL '5 days', now() - INTERVAL '5 days'),
  ('44444444-4444-4444-4444-444444444002', 'COT-002', '11111111-1111-1111-1111-111111111002', '00000000-0000-0000-0000-000000000002', 340000.00, 'aprobada', 'Cliente prefiere envío a domicilio.', NULL, now() - INTERVAL '10 days', now() - INTERVAL '3 days'),
  ('44444444-4444-4444-4444-444444444003', 'COT-003', '11111111-1111-1111-1111-111111111003', '00000000-0000-0000-0000-000000000001', 216000.00, 'borrador', '', NULL, now() - INTERVAL '1 day', now() - INTERVAL '1 day'),
  ('44444444-4444-4444-4444-444444444004', 'COT-004', '11111111-1111-1111-1111-111111111001', '00000000-0000-0000-0000-000000000001', 180000.00, 'rechazada', 'Cliente solicitó descuento que no fue aprobado.', NULL, now() - INTERVAL '15 days', now() - INTERVAL '12 days');

-- ===========================
-- Quotation Lines
-- ===========================
-- COT-001 lines
INSERT INTO quotation_lines (id, quotation_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES
  ('55555555-5555-5555-5555-555555555001', '44444444-4444-4444-4444-444444444001', '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333001', 10, 8500.00, 85000.00),
  ('55555555-5555-5555-5555-555555555002', '44444444-4444-4444-4444-444444444001', '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333002', 15, 8500.00, 127500.00);

-- COT-002 lines
INSERT INTO quotation_lines (id, quotation_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES
  ('55555555-5555-5555-5555-555555555003', '44444444-4444-4444-4444-444444444002', '22222222-2222-2222-2222-222222222002', '33333333-3333-3333-3333-333333333005', 8, 25000.00, 200000.00),
  ('55555555-5555-5555-5555-555555555004', '44444444-4444-4444-4444-444444444002', '22222222-2222-2222-2222-222222222003', '33333333-3333-3333-3333-333333333008', 4, 35000.00, 140000.00);

-- COT-003 lines
INSERT INTO quotation_lines (id, quotation_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES
  ('55555555-5555-5555-5555-555555555005', '44444444-4444-4444-4444-444444444003', '22222222-2222-2222-2222-222222222004', '33333333-3333-3333-3333-333333333012', 12, 18000.00, 216000.00);

-- COT-004 lines
INSERT INTO quotation_lines (id, quotation_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES
  ('55555555-5555-5555-5555-555555555006', '44444444-4444-4444-4444-444444444004', '22222222-2222-2222-2222-222222222005', '33333333-3333-3333-3333-333333333015', 6, 15000.00, 90000.00),
  ('55555555-5555-5555-5555-555555555007', '44444444-4444-4444-4444-444444444004', '22222222-2222-2222-2222-222222222005', '33333333-3333-3333-3333-333333333016', 6, 15000.00, 90000.00);

-- ===========================
-- Orders
-- ===========================
INSERT INTO orders (id, number, client_id, seller_id, total, status, notes, due_date, quotation_id, created_at, updated_at) VALUES
  ('66666666-6666-6666-6666-666666666001', 'PED-001', '11111111-1111-1111-1111-111111111002', '00000000-0000-0000-0000-000000000002', 250000.00, 'activo', 'Pedido urgente.', (CURRENT_DATE + INTERVAL '1 day')::DATE, NULL, now() - INTERVAL '7 days', now() - INTERVAL '7 days'),
  ('66666666-6666-6666-6666-666666666002', 'PED-002', '11111111-1111-1111-1111-111111111001', '00000000-0000-0000-0000-000000000002', 180000.00, 'activo', 'Fecha de entrega ya pasada — requiere atención.', (CURRENT_DATE - INTERVAL '3 days')::DATE, NULL, now() - INTERVAL '14 days', now() - INTERVAL '14 days'),
  ('66666666-6666-6666-6666-666666666003', 'PED-003', '11111111-1111-1111-1111-111111111003', '00000000-0000-0000-0000-000000000001', 173000.00, 'entregado', 'Entregado sin observaciones.', (CURRENT_DATE - INTERVAL '1 day')::DATE, '44444444-4444-4444-4444-444444444002', now() - INTERVAL '20 days', now() - INTERVAL '1 day');

-- ===========================
-- Order Lines
-- ===========================
-- PED-001 lines
INSERT INTO order_lines (id, order_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES
  ('77777777-7777-7777-7777-777777777001', '66666666-6666-6666-6666-666666666001', '22222222-2222-2222-2222-222222222002', '33333333-3333-3333-3333-333333333006', 10, 25000.00, 250000.00);

-- PED-002 lines
INSERT INTO order_lines (id, order_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES
  ('77777777-7777-7777-7777-777777777002', '66666666-6666-6666-6666-666666666002', '22222222-2222-2222-2222-222222222004', '33333333-3333-3333-3333-333333333011', 5, 18000.00, 90000.00),
  ('77777777-7777-7777-7777-777777777003', '66666666-6666-6666-6666-666666666002', '22222222-2222-2222-2222-222222222004', '33333333-3333-3333-3333-333333333013', 5, 18000.00, 90000.00);

-- PED-003 lines
INSERT INTO order_lines (id, order_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES
  ('77777777-7777-7777-7777-777777777004', '66666666-6666-6666-6666-666666666003', '22222222-2222-2222-2222-222222222003', '33333333-3333-3333-3333-333333333009', 3, 35000.00, 105000.00),
  ('77777777-7777-7777-7777-777777777005', '66666666-6666-6666-6666-666666666003', '22222222-2222-2222-2222-222222222001', '33333333-3333-3333-3333-333333333004', 8, 8500.00, 68000.00);

-- ===========================
-- Deposits
-- ===========================
-- PED-002 deposits
INSERT INTO deposits (id, order_id, amount, method, date) VALUES
  ('88888888-8888-8888-8888-888888888001', '66666666-6666-6666-6666-666666666002', 50000.00, 'transferencia', (CURRENT_DATE - INTERVAL '10 days')::DATE);

-- PED-003 deposits
INSERT INTO deposits (id, order_id, amount, method, date) VALUES
  ('88888888-8888-8888-8888-888888888002', '66666666-6666-6666-6666-666666666003', 100000.00, 'transferencia', (CURRENT_DATE - INTERVAL '18 days')::DATE),
  ('88888888-8888-8888-8888-888888888003', '66666666-6666-6666-6666-666666666003', 73000.00, 'efectivo', (CURRENT_DATE - INTERVAL '5 days')::DATE);

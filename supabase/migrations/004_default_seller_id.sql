-- ===========================
-- Set seller_id default to auth.uid() so inserts don't need to provide it
-- and RLS policies always see the correct value.
-- ===========================

-- Set default for quotations.seller_id
ALTER TABLE quotations ALTER COLUMN seller_id SET DEFAULT auth.uid();

-- Set default for orders.seller_id
ALTER TABLE orders ALTER COLUMN seller_id SET DEFAULT auth.uid();

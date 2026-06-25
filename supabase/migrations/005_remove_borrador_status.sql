-- Remove 'borrador' status from quotations.
-- New flow: pendiente → aprobada | rechazada

-- Update any existing borrador quotations to pendiente
UPDATE quotations SET status = 'pendiente' WHERE status = 'borrador';

-- Drop the old constraint and add a new one without 'borrador'
ALTER TABLE quotations DROP CONSTRAINT IF EXISTS quotations_status_check;
ALTER TABLE quotations ADD CONSTRAINT quotations_status_check
  CHECK (status IN ('pendiente', 'aprobada', 'rechazada'));

-- Change the default to 'pendiente'
ALTER TABLE quotations ALTER COLUMN status SET DEFAULT 'pendiente';

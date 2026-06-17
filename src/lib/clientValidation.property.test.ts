import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateClientForm } from '@/lib/clientValidation';

/**
 * Feature: syk-dashboard-ui, Property 16: Validación de formulario de cliente rechaza nombre vacío
 *
 * Para cualquier dato de cliente donde el nombre es una cadena vacía o compuesta exclusivamente
 * de espacios en blanco, la validación SHALL rechazar el envío e indicar que el nombre es requerido.
 * Para cualquier dato de cliente donde el nombre tiene al menos un carácter no-espacio,
 * la validación SHALL pasar (sin error de nombre).
 *
 * **Validates: Requirements 17.8, 18.5**
 */
describe('Feature: syk-dashboard-ui, Property 16: Validación de formulario de cliente rechaza nombre vacío', () => {
  // Generator: empty or whitespace-only name
  const arbEmptyName = fc.constantFrom('', ' ', '   ', '\t', '\n', '  \t\n  ');

  // Generator: non-empty name (contains at least one non-whitespace character)
  const arbNonEmptyName = fc
    .string({ minLength: 1, maxLength: 50 })
    .filter((s) => s.trim().length > 0);

  // Generator: arbitrary email
  const arbEmail = fc.string({ minLength: 0, maxLength: 50 });

  // Generator: arbitrary phone
  const arbPhone = fc.string({ minLength: 0, maxLength: 20 });

  it('rejects client form when name is empty or whitespace-only', () => {
    fc.assert(
      fc.property(arbEmptyName, arbEmail, arbPhone, (name, email, phone) => {
        const errors = validateClientForm({ name, email, phone });
        const fieldNames = errors.map((e) => e.field);
        expect(fieldNames).toContain('name');
      }),
      { numRuns: 100 }
    );
  });

  it('accepts client form when name has non-whitespace characters', () => {
    fc.assert(
      fc.property(arbNonEmptyName, arbEmail, arbPhone, (name, email, phone) => {
        const errors = validateClientForm({ name, email, phone });
        const fieldNames = errors.map((e) => e.field);
        expect(fieldNames).not.toContain('name');
      }),
      { numRuns: 100 }
    );
  });
});

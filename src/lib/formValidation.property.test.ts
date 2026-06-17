import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateQuotationForm, validateOrderForm } from '@/lib/formValidation';

/**
 * Feature: syk-dashboard-ui, Property 10: Validación de formularios rechaza datos incompletos
 *
 * Para cualquier formulario de cotización sin cliente o sin al menos una línea de producto,
 * o cualquier formulario de pedido sin cliente, sin fecha de entrega o sin al menos una línea,
 * el sistema SHALL rechazar el envío y mostrar mensajes de validación.
 *
 * **Validates: Requirements 5.6, 8.4**
 */
describe('Feature: syk-dashboard-ui, Property 10: Validación de formularios rechaza datos incompletos', () => {
  // Generator: a valid product line
  const arbLine = fc.record({
    productId: fc.uuid(),
    variantId: fc.uuid(),
    quantity: fc.integer({ min: 1, max: 1000 }),
    unitPrice: fc.integer({ min: 1, max: 100000 }),
  });

  // Generator: non-empty array of lines
  const arbLines = fc.array(arbLine, { minLength: 1, maxLength: 10 });

  // Generator: a non-empty, non-whitespace clientId
  const arbClientId = fc.string({ minLength: 1, maxLength: 30 }).filter(
    (s) => s.trim().length > 0
  );

  // Generator: a valid ISO date string for dueDate (YYYY-MM-DD)
  const arbDueDate = fc
    .record({
      year: fc.integer({ min: 2020, max: 2030 }),
      month: fc.integer({ min: 1, max: 12 }),
      day: fc.integer({ min: 1, max: 28 }),
    })
    .map(({ year, month, day }) =>
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    );

  // Generator: empty or whitespace-only clientId
  const arbEmptyClientId = fc.constantFrom('', '   ', '\t', '\n');

  // Generator: empty or whitespace-only dueDate
  const arbEmptyDueDate = fc.constantFrom('', '   ', '\t', '\n');

  // ===== validateQuotationForm =====

  describe('validateQuotationForm', () => {
    it('rejects form without client (error includes clientId field)', () => {
      fc.assert(
        fc.property(arbEmptyClientId, arbLines, (clientId, lines) => {
          const errors = validateQuotationForm({ clientId, lines });
          const fieldNames = errors.map((e) => e.field);
          expect(fieldNames).toContain('clientId');
        }),
        { numRuns: 100 }
      );
    });

    it('rejects form without lines (error includes lines field)', () => {
      fc.assert(
        fc.property(arbClientId, (clientId) => {
          const errors = validateQuotationForm({ clientId, lines: [] });
          const fieldNames = errors.map((e) => e.field);
          expect(fieldNames).toContain('lines');
        }),
        { numRuns: 100 }
      );
    });

    it('valid form (has client + lines) returns empty array', () => {
      fc.assert(
        fc.property(arbClientId, arbLines, (clientId, lines) => {
          const errors = validateQuotationForm({ clientId, lines });
          expect(errors).toEqual([]);
        }),
        { numRuns: 100 }
      );
    });
  });

  // ===== validateOrderForm =====

  describe('validateOrderForm', () => {
    it('rejects form without client (error includes clientId field)', () => {
      fc.assert(
        fc.property(arbEmptyClientId, arbDueDate, arbLines, (clientId, dueDate, lines) => {
          const errors = validateOrderForm({ clientId, dueDate, lines });
          const fieldNames = errors.map((e) => e.field);
          expect(fieldNames).toContain('clientId');
        }),
        { numRuns: 100 }
      );
    });

    it('rejects form without dueDate (error includes dueDate field)', () => {
      fc.assert(
        fc.property(arbClientId, arbEmptyDueDate, arbLines, (clientId, dueDate, lines) => {
          const errors = validateOrderForm({ clientId, dueDate, lines });
          const fieldNames = errors.map((e) => e.field);
          expect(fieldNames).toContain('dueDate');
        }),
        { numRuns: 100 }
      );
    });

    it('rejects form without lines (error includes lines field)', () => {
      fc.assert(
        fc.property(arbClientId, arbDueDate, (clientId, dueDate) => {
          const errors = validateOrderForm({ clientId, dueDate, lines: [] });
          const fieldNames = errors.map((e) => e.field);
          expect(fieldNames).toContain('lines');
        }),
        { numRuns: 100 }
      );
    });

    it('valid form (has client + dueDate + lines) returns empty array', () => {
      fc.assert(
        fc.property(arbClientId, arbDueDate, arbLines, (clientId, dueDate, lines) => {
          const errors = validateOrderForm({ clientId, dueDate, lines });
          expect(errors).toEqual([]);
        }),
        { numRuns: 100 }
      );
    });
  });
});

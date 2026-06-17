import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateSubtotal, calculateDocumentTotal } from '@/lib/calculateTotals';

/**
 * Feature: syk-dashboard-ui, Property 1: Cálculo de totales en líneas de producto
 *
 * Para cualquier lista de líneas de producto con cantidades y precios unitarios
 * arbitrarios (positivos), el subtotal de cada línea SHALL ser igual a
 * quantity × unitPrice, y el total del documento (cotización o pedido) SHALL ser
 * igual a la suma de todos los subtotales.
 *
 * **Validates: Requirements 5.3, 5.5**
 */
describe('Feature: syk-dashboard-ui, Property 1: Cálculo de totales en líneas de producto', () => {
  it('calculateSubtotal: para cualquier quantity y unitPrice positivos, el resultado es quantity × unitPrice', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 100000 }),
        (quantity, unitPrice) => {
          const result = calculateSubtotal(quantity, unitPrice);
          expect(result).toBe(quantity * unitPrice);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('calculateDocumentTotal: para cualquier array de líneas con quantity/unitPrice positivos, el total es la suma de (quantity × unitPrice) por cada línea', () => {
    const arbLine = fc.record({
      quantity: fc.integer({ min: 1, max: 1000 }),
      unitPrice: fc.integer({ min: 1, max: 100000 }),
    });

    fc.assert(
      fc.property(
        fc.array(arbLine, { minLength: 0, maxLength: 20 }),
        (lines) => {
          const result = calculateDocumentTotal(lines);
          const expectedTotal = lines.reduce(
            (sum, line) => sum + line.quantity * line.unitPrice,
            0
          );
          expect(result).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });
});

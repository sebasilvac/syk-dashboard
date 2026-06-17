import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { hasLowStock } from '@/components/LowStockIndicator';
import type { Variant } from '@/types/models';

/**
 * Feature: syk-dashboard-ui, Property 13: Indicador de stock bajo en productos
 *
 * Para cualquier producto, si al menos una de sus variantes tiene stock ≤ minStock,
 * la fila del producto en la tabla de inventario SHALL mostrar un indicador visual de stock bajo.
 *
 * **Validates: Requirements 10.2**
 */

// --- Generators ---

const arbVariant: fc.Arbitrary<Variant> = fc.record({
  id: fc.uuid(),
  size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
  color: fc.constantFrom('Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'),
  stock: fc.integer({ min: 0, max: 500 }),
  minStock: fc.integer({ min: 1, max: 50 }),
});

describe('Feature: syk-dashboard-ui, Property 13: Indicador de stock bajo en productos', () => {
  it('hasLowStock returns true iff any variant has stock <= minStock', () => {
    fc.assert(
      fc.property(
        fc.array(arbVariant, { minLength: 1, maxLength: 10 }),
        (variants) => {
          const expected = variants.some((v) => v.stock <= v.minStock);
          const result = hasLowStock(variants);
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns false for an empty variants array', () => {
    expect(hasLowStock([])).toBe(false);
  });

  it('returns true when all variants have low stock', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            size: fc.constantFrom('S', 'M', 'L'),
            color: fc.constantFrom('Rojo', 'Azul'),
            stock: fc.integer({ min: 0, max: 10 }),
            minStock: fc.integer({ min: 10, max: 50 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (variants) => {
          // All variants have stock <= minStock
          expect(hasLowStock(variants)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns false when all variants have stock > minStock', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            size: fc.constantFrom('S', 'M', 'L'),
            color: fc.constantFrom('Rojo', 'Azul'),
            stock: fc.integer({ min: 51, max: 500 }),
            minStock: fc.integer({ min: 1, max: 50 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (variants) => {
          // All variants have stock > minStock
          expect(hasLowStock(variants)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

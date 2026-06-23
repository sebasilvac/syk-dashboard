import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  mapClient,
  mapVariant,
  mapProduct,
  mapQuotationLine,
  mapOrderLine,
  mapDeposit,
} from './mappers';

/**
 * Feature: supabase-integration, Property 4: Database row mapping round-trip preserves data
 *
 * For any valid database row, the mapping function produces an object where every
 * model field contains the same value as the corresponding database column.
 *
 * **Validates: Requirements 5.3**
 */
describe('Feature: supabase-integration, Property 4: Database row mapping round-trip preserves data', () => {
  it('mapClient preserves all fields from client row', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.string({ minLength: 1, maxLength: 100 }),
          phone: fc.string({ minLength: 1, maxLength: 30 }),
          created_at: fc.string({ minLength: 1, maxLength: 50 }),
          updated_at: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        (row) => {
          const result = mapClient(row);
          expect(result.id).toBe(row.id);
          expect(result.name).toBe(row.name);
          expect(result.email).toBe(row.email);
          expect(result.phone).toBe(row.phone);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mapVariant preserves all fields and maps min_stock to minStock', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          product_id: fc.uuid(),
          size: fc.string({ minLength: 1, maxLength: 20 }),
          color: fc.string({ minLength: 1, maxLength: 30 }),
          stock: fc.integer({ min: 0, max: 100000 }),
          min_stock: fc.integer({ min: 0, max: 100000 }),
          created_at: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        (row) => {
          const result = mapVariant(row);
          expect(result.id).toBe(row.id);
          expect(result.size).toBe(row.size);
          expect(result.color).toBe(row.color);
          expect(result.stock).toBe(row.stock);
          expect(result.minStock).toBe(row.min_stock);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mapProduct preserves product fields and maps nested variants', () => {
    const variantRowArb = fc.record({
      id: fc.uuid(),
      product_id: fc.uuid(),
      size: fc.string({ minLength: 1, maxLength: 20 }),
      color: fc.string({ minLength: 1, maxLength: 30 }),
      stock: fc.integer({ min: 0, max: 100000 }),
      min_stock: fc.integer({ min: 0, max: 100000 }),
      created_at: fc.string({ minLength: 1, maxLength: 50 }),
    });

    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 1, maxLength: 100 }),
          category: fc.string({ minLength: 1, maxLength: 50 }),
          created_at: fc.string({ minLength: 1, maxLength: 50 }),
          updated_at: fc.string({ minLength: 1, maxLength: 50 }),
          variants: fc.array(variantRowArb, { minLength: 0, maxLength: 5 }),
        }),
        (row) => {
          const result = mapProduct(row);
          expect(result.id).toBe(row.id);
          expect(result.name).toBe(row.name);
          expect(result.category).toBe(row.category);
          expect(result.variants).toHaveLength(row.variants.length);

          for (let i = 0; i < row.variants.length; i++) {
            expect(result.variants[i]!.id).toBe(row.variants[i]!.id);
            expect(result.variants[i]!.size).toBe(row.variants[i]!.size);
            expect(result.variants[i]!.color).toBe(row.variants[i]!.color);
            expect(result.variants[i]!.stock).toBe(row.variants[i]!.stock);
            expect(result.variants[i]!.minStock).toBe(row.variants[i]!.min_stock);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mapQuotationLine preserves all fields with snake_case to camelCase mapping', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          quotation_id: fc.uuid(),
          product_id: fc.uuid(),
          variant_id: fc.uuid(),
          quantity: fc.integer({ min: 1, max: 100000 }),
          unit_price: fc.integer({ min: 0, max: 10000000 }),
          subtotal: fc.integer({ min: 0, max: 10000000 }),
        }),
        (row) => {
          const result = mapQuotationLine(row);
          expect(result.id).toBe(row.id);
          expect(result.productId).toBe(row.product_id);
          expect(result.variantId).toBe(row.variant_id);
          expect(result.quantity).toBe(row.quantity);
          expect(result.unitPrice).toBe(row.unit_price);
          expect(result.subtotal).toBe(row.subtotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mapDeposit preserves all fields with correct method mapping', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          order_id: fc.uuid(),
          amount: fc.integer({ min: 1, max: 10000000 }),
          method: fc.constantFrom('transferencia', 'efectivo'),
          date: fc.string({ minLength: 10, maxLength: 10 }),
          created_at: fc.string({ minLength: 1, maxLength: 50 }),
        }),
        (row) => {
          const result = mapDeposit(row);
          expect(result.id).toBe(row.id);
          expect(result.amount).toBe(row.amount);
          expect(result.method).toBe(row.method);
          expect(result.date).toBe(row.date);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('mapOrderLine preserves all fields with snake_case to camelCase mapping', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          order_id: fc.uuid(),
          product_id: fc.uuid(),
          variant_id: fc.uuid(),
          quantity: fc.integer({ min: 1, max: 100000 }),
          unit_price: fc.integer({ min: 0, max: 10000000 }),
          subtotal: fc.integer({ min: 0, max: 10000000 }),
        }),
        (row) => {
          const result = mapOrderLine(row);
          expect(result.id).toBe(row.id);
          expect(result.productId).toBe(row.product_id);
          expect(result.variantId).toBe(row.variant_id);
          expect(result.quantity).toBe(row.quantity);
          expect(result.unitPrice).toBe(row.unit_price);
          expect(result.subtotal).toBe(row.subtotal);
        }
      ),
      { numRuns: 100 }
    );
  });
});

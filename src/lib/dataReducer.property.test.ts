import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { dataReducer } from '@/lib/dataReducer';
import type { AppData, ProductLine, Quotation, Product } from '@/types/models';

/**
 * Feature: syk-dashboard-ui, Property 7: Creación de pedido desde cotización preserva líneas
 *
 * Para cualquier cotización aprobada con N líneas de producto, al crear un pedido
 * desde ella, el pedido resultante SHALL contener exactamente las mismas N líneas
 * con idénticos productId, variantId, quantity y unitPrice.
 *
 * **Validates: Requirements 6.3**
 */
describe('Feature: syk-dashboard-ui, Property 7: Creación de pedido desde cotización preserva líneas', () => {
  // Generator: a product line
  const arbProductLine: fc.Arbitrary<ProductLine> = fc.record({
    id: fc.uuid(),
    productId: fc.uuid(),
    variantId: fc.uuid(),
    quantity: fc.integer({ min: 1, max: 1000 }),
    unitPrice: fc.integer({ min: 1, max: 100000 }),
    subtotal: fc.constant(0), // will be derived
  }).map((line) => ({
    ...line,
    subtotal: line.quantity * line.unitPrice,
  }));

  // Generator: an approved quotation with non-empty lines
  const arbApprovedQuotation: fc.Arbitrary<Quotation> = fc.record({
    id: fc.uuid(),
    number: fc.constant('COT-001'),
    clientId: fc.uuid(),
    sellerId: fc.uuid(),
    lines: fc.array(arbProductLine, { minLength: 1, maxLength: 10 }),
    total: fc.constant(0), // will be derived
    status: fc.constant('aprobada' as const),
    notes: fc.string({ minLength: 0, maxLength: 50 }),
    createdAt: fc.constant(new Date().toISOString()),
    updatedAt: fc.constant(new Date().toISOString()),
  }).map((q) => ({
    ...q,
    total: q.lines.reduce((sum, l) => sum + l.subtotal, 0),
  }));

  // Generator: dueDate as ISO string (using integer offset to avoid invalid date issues)
  const arbDueDate = fc.integer({ min: 1, max: 30 }).map((daysFromNow) => {
    const date = new Date(Date.now() + daysFromNow * 86400000);
    return date.toISOString();
  });

  /**
   * Builds an AppData state with products that contain variants matching the
   * quotation's lines, ensuring deductStock will find them.
   */
  const arbStateWithApprovedQuotation = arbApprovedQuotation.chain((quotation) => {
    // Create products with variants whose IDs match the quotation lines
    const productsFromLines: Product[] = quotation.lines.map((line) => ({
      id: line.productId,
      name: 'Product',
      category: 'Cat',
      variants: [
        {
          id: line.variantId,
          size: 'M',
          color: 'Negro',
          stock: 5000, // enough stock
          minStock: 10,
        },
      ],
    }));

    return arbDueDate.map((dueDate) => ({
      state: {
        clients: [],
        products: productsFromLines,
        quotations: [quotation],
        orders: [],
      } as AppData,
      quotationId: quotation.id,
      dueDate,
      expectedLines: quotation.lines,
    }));
  });

  it('the resulting order has exactly N lines with matching productId, variantId, quantity, and unitPrice', () => {
    fc.assert(
      fc.property(arbStateWithApprovedQuotation, ({ state, quotationId, dueDate, expectedLines }) => {
        const result = dataReducer(state, {
          type: 'ORDER_CREATE_FROM_QUOTATION',
          payload: { quotationId, dueDate },
        });

        // A new order should be created
        expect(result.orders).toHaveLength(1);
        const order = result.orders[0]!;

        // The order should have exactly the same number of lines
        expect(order.lines).toHaveLength(expectedLines.length);

        // Each line must preserve productId, variantId, quantity, unitPrice
        for (let i = 0; i < expectedLines.length; i++) {
          const expectedLine = expectedLines[i]!;
          const orderLine = order.lines[i]!;

          expect(orderLine.productId).toBe(expectedLine.productId);
          expect(orderLine.variantId).toBe(expectedLine.variantId);
          expect(orderLine.quantity).toBe(expectedLine.quantity);
          expect(orderLine.unitPrice).toBe(expectedLine.unitPrice);
        }
      }),
      { numRuns: 100 }
    );
  });
});

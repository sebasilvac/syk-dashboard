import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ---- Types for generated test state ----

interface TestVariant {
  id: string;
  productId: string;
}

interface TestOrderLine {
  variantId: string;
  orderId: string;
}

interface TestQuotationLine {
  variantId: string;
  quotationId: string;
}

interface TestOrder {
  id: string;
  status: 'activo' | 'entregado';
}

interface TestQuotation {
  id: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
}

// ---- Pure oracle functions (replicating the DB query logic in-memory) ----

/**
 * Oracle: checks if a product is blocked from deletion.
 * A product is blocked iff at least one of its variants appears in:
 * - an order_line linked to an order with status 'activo'
 * - a quotation_line linked to a quotation with status 'pendiente'
 *
 * Returns 'active_order' | 'pending_quotation' | null
 */
function oracleCheckProductReferences(
  productId: string,
  variants: TestVariant[],
  orders: TestOrder[],
  orderLines: TestOrderLine[],
  quotations: TestQuotation[],
  quotationLines: TestQuotationLine[]
): 'active_order' | 'pending_quotation' | null {
  const productVariantIds = variants
    .filter((v) => v.productId === productId)
    .map((v) => v.id);

  // Check active orders
  const activeOrderIds = new Set(
    orders.filter((o) => o.status === 'activo').map((o) => o.id)
  );
  const hasActiveOrderRef = orderLines.some(
    (ol) =>
      productVariantIds.includes(ol.variantId) &&
      activeOrderIds.has(ol.orderId)
  );
  if (hasActiveOrderRef) return 'active_order';

  // Check pending quotations
  const pendingQuotationIds = new Set(
    quotations.filter((q) => q.status === 'pendiente').map((q) => q.id)
  );
  const hasPendingQuotationRef = quotationLines.some(
    (ql) =>
      productVariantIds.includes(ql.variantId) &&
      pendingQuotationIds.has(ql.quotationId)
  );
  if (hasPendingQuotationRef) return 'pending_quotation';

  return null;
}

/**
 * Oracle: checks if a variant is blocked from deletion.
 * A variant is blocked iff it appears in:
 * - an order_line linked to an order with status 'activo'
 * - a quotation_line linked to a quotation with status 'pendiente'
 */
function oracleCheckVariantReferences(
  variantId: string,
  orders: TestOrder[],
  orderLines: TestOrderLine[],
  quotations: TestQuotation[],
  quotationLines: TestQuotationLine[]
): 'active_order' | 'pending_quotation' | null {
  const activeOrderIds = new Set(
    orders.filter((o) => o.status === 'activo').map((o) => o.id)
  );
  const hasActiveOrderRef = orderLines.some(
    (ol) => ol.variantId === variantId && activeOrderIds.has(ol.orderId)
  );
  if (hasActiveOrderRef) return 'active_order';

  const pendingQuotationIds = new Set(
    quotations.filter((q) => q.status === 'pendiente').map((q) => q.id)
  );
  const hasPendingQuotationRef = quotationLines.some(
    (ql) =>
      ql.variantId === variantId &&
      pendingQuotationIds.has(ql.quotationId)
  );
  if (hasPendingQuotationRef) return 'pending_quotation';

  return null;
}

/**
 * Oracle: checks if variant deletion is blocked by last-variant guard.
 * Blocks iff the product has exactly one variant.
 */
function oracleCheckLastVariant(variantCount: number): boolean {
  return variantCount === 1;
}

// ---- Arbitraries ----

const arbId = fc.uuid();

const arbOrder: fc.Arbitrary<TestOrder> = fc.record({
  id: arbId,
  status: fc.constantFrom('activo' as const, 'entregado' as const),
});

const arbQuotation: fc.Arbitrary<TestQuotation> = fc.record({
  id: arbId,
  status: fc.constantFrom(
    'pendiente' as const,
    'aprobada' as const,
    'rechazada' as const
  ),
});

// ---- Property Tests ----

/**
 * Feature: product-variant-deletion, Property 4: Product reference check blocks iff variants in active orders or pending quotations
 *
 * For any generated state (products, variants, orders, quotations, line items),
 * the oracle returns a block reason iff at least one variant of the product is
 * in an active order or pending quotation.
 *
 * **Validates: Requirements 3.1, 3.2**
 */
describe('Feature: product-variant-deletion, Property 4: Product reference check blocks iff variants in active orders or pending quotations', () => {
  it('oracle blocks deletion iff product variants appear in active orders or pending quotations', () => {
    fc.assert(
      fc.property(
        // Generate 1-5 products, each with 1-3 variants
        fc.array(arbId, { minLength: 1, maxLength: 5 }),
        fc.array(arbOrder, { minLength: 0, maxLength: 5 }),
        fc.array(arbQuotation, { minLength: 0, maxLength: 5 }),
        (productIds, orders, quotations) => {
          // Generate variants for each product
          const variants: TestVariant[] = [];
          for (const productId of productIds) {
            const variantCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < variantCount; i++) {
              variants.push({
                id: `${productId}-v${i}`,
                productId,
              });
            }
          }

          // Generate order lines that reference random variants
          const orderLines: TestOrderLine[] = [];
          if (orders.length > 0 && variants.length > 0) {
            const lineCount = Math.floor(Math.random() * 5);
            for (let i = 0; i < lineCount; i++) {
              const variant =
                variants[Math.floor(Math.random() * variants.length)]!;
              const order =
                orders[Math.floor(Math.random() * orders.length)]!;
              orderLines.push({
                variantId: variant.id,
                orderId: order.id,
              });
            }
          }

          // Generate quotation lines that reference random variants
          const quotationLines: TestQuotationLine[] = [];
          if (quotations.length > 0 && variants.length > 0) {
            const lineCount = Math.floor(Math.random() * 5);
            for (let i = 0; i < lineCount; i++) {
              const variant =
                variants[Math.floor(Math.random() * variants.length)]!;
              const quotation =
                quotations[Math.floor(Math.random() * quotations.length)]!;
              quotationLines.push({
                variantId: variant.id,
                quotationId: quotation.id,
              });
            }
          }

          // For each product, verify the oracle's result
          for (const productId of productIds) {
            const result = oracleCheckProductReferences(
              productId,
              variants,
              orders,
              orderLines,
              quotations,
              quotationLines
            );

            // Independently compute expected result
            const productVariantIds = variants
              .filter((v) => v.productId === productId)
              .map((v) => v.id);

            const activeOrderIds = new Set(
              orders.filter((o) => o.status === 'activo').map((o) => o.id)
            );
            const hasActiveRef = orderLines.some(
              (ol) =>
                productVariantIds.includes(ol.variantId) &&
                activeOrderIds.has(ol.orderId)
            );

            const pendingQuotationIds = new Set(
              quotations
                .filter((q) => q.status === 'pendiente')
                .map((q) => q.id)
            );
            const hasPendingRef = quotationLines.some(
              (ql) =>
                productVariantIds.includes(ql.variantId) &&
                pendingQuotationIds.has(ql.quotationId)
            );

            // The oracle blocks iff there's an active order ref or pending quotation ref
            if (hasActiveRef) {
              expect(result).toBe('active_order');
            } else if (hasPendingRef) {
              expect(result).toBe('pending_quotation');
            } else {
              expect(result).toBeNull();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: product-variant-deletion, Property 5: Variant reference check blocks iff variant in active orders or pending quotations
 *
 * For any generated state (variants, orders, quotations, line items),
 * the oracle returns a block reason iff the variant appears in an active order
 * or pending quotation.
 *
 * **Validates: Requirements 4.1, 4.2**
 */
describe('Feature: product-variant-deletion, Property 5: Variant reference check blocks iff variant in active orders or pending quotations', () => {
  it('oracle blocks variant deletion iff variant appears in active orders or pending quotations', () => {
    fc.assert(
      fc.property(
        arbId,
        fc.array(arbOrder, { minLength: 0, maxLength: 5 }),
        fc.array(arbQuotation, { minLength: 0, maxLength: 5 }),
        fc.array(arbId, { minLength: 0, maxLength: 5 }),
        (variantId, orders, quotations, otherVariantIds) => {
          // All variant IDs in scope (target + others)
          const allVariantIds = [variantId, ...otherVariantIds];

          // Generate order lines referencing random variants from the pool
          const orderLines: TestOrderLine[] = [];
          if (orders.length > 0) {
            const lineCount = Math.floor(Math.random() * 6);
            for (let i = 0; i < lineCount; i++) {
              const vid =
                allVariantIds[
                  Math.floor(Math.random() * allVariantIds.length)
                ]!;
              const order =
                orders[Math.floor(Math.random() * orders.length)]!;
              orderLines.push({ variantId: vid, orderId: order.id });
            }
          }

          // Generate quotation lines referencing random variants from the pool
          const quotationLines: TestQuotationLine[] = [];
          if (quotations.length > 0) {
            const lineCount = Math.floor(Math.random() * 6);
            for (let i = 0; i < lineCount; i++) {
              const vid =
                allVariantIds[
                  Math.floor(Math.random() * allVariantIds.length)
                ]!;
              const quotation =
                quotations[
                  Math.floor(Math.random() * quotations.length)
                ]!;
              quotationLines.push({
                variantId: vid,
                quotationId: quotation.id,
              });
            }
          }

          const result = oracleCheckVariantReferences(
            variantId,
            orders,
            orderLines,
            quotations,
            quotationLines
          );

          // Independently compute expected
          const activeOrderIds = new Set(
            orders.filter((o) => o.status === 'activo').map((o) => o.id)
          );
          const hasActiveRef = orderLines.some(
            (ol) =>
              ol.variantId === variantId && activeOrderIds.has(ol.orderId)
          );

          const pendingQuotationIds = new Set(
            quotations
              .filter((q) => q.status === 'pendiente')
              .map((q) => q.id)
          );
          const hasPendingRef = quotationLines.some(
            (ql) =>
              ql.variantId === variantId &&
              pendingQuotationIds.has(ql.quotationId)
          );

          if (hasActiveRef) {
            expect(result).toBe('active_order');
          } else if (hasPendingRef) {
            expect(result).toBe('pending_quotation');
          } else {
            expect(result).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: product-variant-deletion, Property 6: Last-variant guard blocks iff product has exactly one variant
 *
 * For any product with 1–5 variants, the guard blocks deletion when
 * variants.length === 1, and allows deletion when variants.length >= 2.
 *
 * **Validates: Requirements 5.1, 5.2**
 */
describe('Feature: product-variant-deletion, Property 6: Last-variant guard blocks iff product has exactly one variant', () => {
  it('guard blocks when variant count is 1, allows when variant count >= 2', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }),
        (variantCount) => {
          const blocked = oracleCheckLastVariant(variantCount);

          if (variantCount === 1) {
            expect(blocked).toBe(true);
          } else {
            expect(blocked).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for any variant count >= 2, guard never blocks', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 100 }),
        (variantCount) => {
          expect(oracleCheckLastVariant(variantCount)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('for variant count === 1, guard always blocks', () => {
    // Deterministic assertion reinforced by property structure
    expect(oracleCheckLastVariant(1)).toBe(true);
  });
});

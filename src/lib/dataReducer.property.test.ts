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


/**
 * Feature: product-variant-deletion, Property 1: Product deletion removes product and all its variants from state
 *
 * Para cualquier estado AppData válido conteniendo un producto con cualquier número de variantes,
 * cuando se despacha una acción PRODUCT_DELETE para ese producto, el estado resultante NO DEBE
 * contener el producto en el arreglo de productos, y ninguna variante perteneciente a ese producto
 * debe existir en las variantes de cualquier producto restante.
 *
 * **Validates: Requirements 1.2**
 */
describe('Feature: product-variant-deletion, Property 1: Product deletion removes product and all its variants from state', () => {
  // Generator: a variant
  const arbVariant: fc.Arbitrary<import('@/types/models').Variant> = fc.record({
    id: fc.uuid(),
    size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
    color: fc.constantFrom('Negro', 'Blanco', 'Rojo', 'Azul'),
    stock: fc.integer({ min: 0, max: 1000 }),
    minStock: fc.integer({ min: 0, max: 100 }),
  });

  // Generator: a product with 1–5 variants
  const arbProduct: fc.Arbitrary<Product> = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    category: fc.string({ minLength: 1, maxLength: 20 }),
    variants: fc.array(arbVariant, { minLength: 1, maxLength: 5 }),
  });

  // Generator: AppData with 1–10 products
  const arbAppDataWithProducts: fc.Arbitrary<{ state: AppData; targetProductId: string; targetVariantIds: string[] }> =
    fc.array(arbProduct, { minLength: 1, maxLength: 10 }).chain((products) => {
      return fc.integer({ min: 0, max: products.length - 1 }).map((index) => {
        const targetProduct = products[index]!;
        return {
          state: {
            clients: [],
            products,
            quotations: [],
            orders: [],
          } as AppData,
          targetProductId: targetProduct.id,
          targetVariantIds: targetProduct.variants.map((v) => v.id),
        };
      });
    });

  it('the deleted product and all its variants are removed from the resulting state', () => {
    fc.assert(
      fc.property(arbAppDataWithProducts, ({ state, targetProductId, targetVariantIds }) => {
        const result = dataReducer(state, {
          type: 'PRODUCT_DELETE',
          payload: { id: targetProductId },
        });

        // The deleted product should not exist in the resulting products array
        const deletedProduct = result.products.find((p) => p.id === targetProductId);
        expect(deletedProduct).toBeUndefined();

        // No variant belonging to the deleted product should exist in any remaining product
        const allRemainingVariantIds = result.products.flatMap((p) => p.variants.map((v) => v.id));
        for (const variantId of targetVariantIds) {
          expect(allRemainingVariantIds).not.toContain(variantId);
        }

        // The number of products should be reduced by exactly 1
        expect(result.products).toHaveLength(state.products.length - 1);
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Feature: product-variant-deletion, Property 2: Variant deletion removes only the targeted variant
 *
 * Para cualquier estado AppData válido conteniendo un producto con dos o más variantes,
 * cuando se despacha una acción VARIANT_DELETE para una variante específica, el estado resultante
 * DEBE contener el mismo producto con exactamente una variante menos, la variante eliminada DEBE
 * ser la que fue objetivo, y todas las demás variantes DEBEN permanecer sin cambios.
 *
 * **Validates: Requirements 2.2**
 */
describe('Feature: product-variant-deletion, Property 2: Variant deletion removes only the targeted variant', () => {
  // Generator: a variant
  const arbVariant: fc.Arbitrary<import('@/types/models').Variant> = fc.record({
    id: fc.uuid(),
    size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
    color: fc.constantFrom('Negro', 'Blanco', 'Rojo', 'Azul'),
    stock: fc.integer({ min: 0, max: 1000 }),
    minStock: fc.integer({ min: 0, max: 100 }),
  });

  // Generator: a product with 2–5 variants (minimum 2 so we can delete one)
  const arbProductWith2PlusVariants: fc.Arbitrary<Product> = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    category: fc.string({ minLength: 1, maxLength: 20 }),
    variants: fc.array(arbVariant, { minLength: 2, maxLength: 5 }),
  });

  // Generator: AppData with a target product (2+ variants) and a randomly chosen variant to delete
  const arbStateWithVariantToDelete: fc.Arbitrary<{
    state: AppData;
    targetProductId: string;
    targetVariantId: string;
    expectedRemainingVariants: import('@/types/models').Variant[];
  }> = arbProductWith2PlusVariants.chain((targetProduct) => {
    // Also generate some other products to ensure they are unaffected
    const arbOtherProduct: fc.Arbitrary<Product> = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 30 }),
      category: fc.string({ minLength: 1, maxLength: 20 }),
      variants: fc.array(arbVariant, { minLength: 1, maxLength: 5 }),
    });

    return fc.tuple(
      fc.integer({ min: 0, max: targetProduct.variants.length - 1 }),
      fc.array(arbOtherProduct, { minLength: 0, maxLength: 5 })
    ).map(([variantIndex, otherProducts]) => {
      const targetVariant = targetProduct.variants[variantIndex]!;
      const expectedRemainingVariants = targetProduct.variants.filter(
        (v) => v.id !== targetVariant.id
      );

      return {
        state: {
          clients: [],
          products: [targetProduct, ...otherProducts],
          quotations: [],
          orders: [],
        } as AppData,
        targetProductId: targetProduct.id,
        targetVariantId: targetVariant.id,
        expectedRemainingVariants,
      };
    });
  });

  it('the targeted variant is removed and all other variants remain unchanged', () => {
    fc.assert(
      fc.property(arbStateWithVariantToDelete, ({ state, targetProductId, targetVariantId, expectedRemainingVariants }) => {
        const result = dataReducer(state, {
          type: 'VARIANT_DELETE',
          payload: { productId: targetProductId, variantId: targetVariantId },
        });

        // The product should still exist in the resulting state
        const resultProduct = result.products.find((p) => p.id === targetProductId);
        expect(resultProduct).toBeDefined();

        // The product should have exactly one fewer variant
        const originalProduct = state.products.find((p) => p.id === targetProductId)!;
        expect(resultProduct!.variants).toHaveLength(originalProduct.variants.length - 1);

        // The removed variant should be the targeted one
        const deletedVariant = resultProduct!.variants.find((v) => v.id === targetVariantId);
        expect(deletedVariant).toBeUndefined();

        // All other variants should remain unchanged (same content)
        expect(resultProduct!.variants).toEqual(expectedRemainingVariants);

        // Other products should be completely unaffected
        const otherProducts = result.products.filter((p) => p.id !== targetProductId);
        const originalOtherProducts = state.products.filter((p) => p.id !== targetProductId);
        expect(otherProducts).toEqual(originalOtherProducts);
      }),
      { numRuns: 100 }
    );
  });
});

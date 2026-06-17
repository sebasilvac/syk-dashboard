import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { deductStock } from '@/lib/stockValidation';

/**
 * Feature: syk-dashboard-ui, Property 8: Creación de pedido descuenta inventario
 *
 * Para cualquier pedido válido con líneas que no excedan el stock disponible,
 * al confirmar el pedido, el stock de cada variante referenciada SHALL decrementar
 * exactamente en la cantidad ordenada.
 *
 * **Validates: Requirements 8.3**
 */
describe('Feature: syk-dashboard-ui, Property 8: Creación de pedido descuenta inventario', () => {
  // Generator: a variant with valid stock
  const arbVariant = fc.record({
    id: fc.uuid(),
    size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
    color: fc.constantFrom('Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'),
    stock: fc.integer({ min: 1, max: 500 }),
    minStock: fc.integer({ min: 1, max: 50 }),
  });

  // Generator: a product with 1-5 variants
  const arbProduct = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    category: fc.constantFrom('Camisas', 'Pantalones', 'Zapatos', 'Accesorios'),
    variants: fc.array(arbVariant, { minLength: 1, maxLength: 5 }),
  });

  // Generator: array of products
  const arbProducts = fc.array(arbProduct, { minLength: 1, maxLength: 5 });

  /**
   * Derives valid deduction items from products where quantity <= stock.
   * Returns a tuple of [products, items] for testing.
   */
  const arbProductsAndValidItems = arbProducts.chain((products) => {
    // Collect all variants with their stock
    const allVariants: Array<{ variantId: string; stock: number }> = [];
    for (const product of products) {
      for (const variant of product.variants) {
        allVariants.push({ variantId: variant.id, stock: variant.stock });
      }
    }

    if (allVariants.length === 0) {
      return fc.constant({ products, items: [] as Array<{ variantId: string; quantity: number }> });
    }

    // Generate items that reference existing variants with quantity <= stock
    const arbItems = fc.array(
      fc.nat({ max: allVariants.length - 1 }).chain((idx) => {
        const v = allVariants[idx]!;
        return fc.integer({ min: 1, max: v!.stock }).map((quantity) => ({
          variantId: v!.variantId,
          quantity,
        }));
      }),
      { minLength: 1, maxLength: Math.min(allVariants.length, 5) }
    ).map((items) => {
      // Deduplicate by variantId (keep first occurrence)
      const seen = new Set<string>();
      return items.filter((item) => {
        if (seen.has(item.variantId)) return false;
        seen.add(item.variantId);
        return true;
      });
    });

    return arbItems.map((items) => ({ products, items }));
  });

  it('each referenced variant stock decreases exactly by the ordered quantity', () => {
    fc.assert(
      fc.property(arbProductsAndValidItems, ({ products, items }) => {
        const result = deductStock(products, items);

        // Build a map of variantId -> quantity for easy lookup
        const deductionMap = new Map(items.map((i) => [i.variantId, i.quantity]));

        // Check each variant in the result
        for (let pIdx = 0; pIdx < result.length; pIdx++) {
          for (let vIdx = 0; vIdx < result[pIdx]!.variants.length; vIdx++) {
            const resultVariant = result[pIdx]!.variants[vIdx]!;
            const originalVariant = products[pIdx]!.variants[vIdx]!;
            const deduction = deductionMap.get(resultVariant.id);

            if (deduction !== undefined) {
              expect(resultVariant.stock).toBe(originalVariant.stock - deduction);
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('variants not referenced in items remain unchanged', () => {
    fc.assert(
      fc.property(arbProductsAndValidItems, ({ products, items }) => {
        const result = deductStock(products, items);

        const referencedIds = new Set(items.map((i) => i.variantId));

        for (let pIdx = 0; pIdx < result.length; pIdx++) {
          for (let vIdx = 0; vIdx < result[pIdx]!.variants.length; vIdx++) {
            const resultVariant = result[pIdx]!.variants[vIdx]!;
            const originalVariant = products[pIdx]!.variants[vIdx]!;

            if (!referencedIds.has(resultVariant.id)) {
              expect(resultVariant.stock).toBe(originalVariant.stock);
            }
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('the original products array is not mutated', () => {
    fc.assert(
      fc.property(arbProductsAndValidItems, ({ products, items }) => {
        // Deep copy original state for comparison
        const originalSnapshot = JSON.parse(JSON.stringify(products));

        deductStock(products, items);

        // Verify original products were not mutated
        expect(products).toEqual(originalSnapshot);
      }),
      { numRuns: 100 }
    );
  });
});

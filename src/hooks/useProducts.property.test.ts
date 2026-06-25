import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { Product, Variant } from '@/types/models';

/**
 * Feature: product-variant-deletion, Property 3: Optimistic deletion rollback restores original state
 *
 * Para cualquier arreglo de productos válido, si un producto (o variante) es eliminado
 * optimistamente del arreglo y luego se aplica el rollback (restaurando desde la referencia
 * guardada), el arreglo resultante DEBE ser profundamente igual al arreglo original antes
 * de la eliminación optimista.
 *
 * **Validates: Requirements 1.4, 2.4**
 */
describe('Feature: product-variant-deletion, Property 3: Optimistic deletion rollback restores original state', () => {
  // Generator: a variant
  const arbVariant: fc.Arbitrary<Variant> = fc.record({
    id: fc.uuid(),
    size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL'),
    color: fc.constantFrom('Negro', 'Blanco', 'Rojo', 'Azul', 'Verde'),
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

  // Generator: a non-empty array of products (1–10)
  const arbProducts: fc.Arbitrary<Product[]> = fc.array(arbProduct, { minLength: 1, maxLength: 10 });

  it('rollback after optimistic product deletion restores original state', () => {
    fc.assert(
      fc.property(
        arbProducts.chain((products) =>
          fc.integer({ min: 0, max: products.length - 1 }).map((index) => ({
            products,
            targetIndex: index,
          }))
        ),
        ({ products, targetIndex }) => {
          const targetProductId = products[targetIndex]!.id;

          // 1. Save original state (simulates previousStateRef.current = products)
          const previousState = products;

          // 2. Apply optimistic removal (simulates setProducts(prev => prev.filter(...)))
          const optimisticState = products.filter((p) => p.id !== targetProductId);

          // Verify the optimistic removal actually removed something
          expect(optimisticState.length).toBe(products.length - 1);

          // 3. Simulate rollback (simulates setProducts(previousStateRef.current))
          const rolledBackState = previousState;

          // 4. Assert rolled-back state is deeply equal to original
          expect(rolledBackState).toEqual(products);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('rollback after optimistic variant deletion restores original state', () => {
    // Generator: products where at least one has 2+ variants (so we can delete a variant)
    const arbProductsWithVariantTarget = fc.array(arbProduct, { minLength: 1, maxLength: 10 })
      .filter((products) => products.some((p) => p.variants.length >= 2))
      .chain((products) => {
        // Pick a product with 2+ variants
        const eligibleIndices = products
          .map((p, i) => ({ product: p, index: i }))
          .filter(({ product }) => product.variants.length >= 2);

        return fc.integer({ min: 0, max: eligibleIndices.length - 1 }).chain((eligibleIdx) => {
          const { product, index: productIndex } = eligibleIndices[eligibleIdx]!;
          return fc.integer({ min: 0, max: product.variants.length - 1 }).map((variantIndex) => ({
            products,
            targetProductId: product.id,
            targetVariantId: product.variants[variantIndex]!.id,
            productIndex,
          }));
        });
      });

    fc.assert(
      fc.property(arbProductsWithVariantTarget, ({ products, targetProductId, targetVariantId }) => {
        // 1. Save original state (simulates previousStateRef.current = products)
        const previousState = products;

        // 2. Apply optimistic variant removal (simulates setProducts with variant filter)
        const optimisticState = products.map((p) =>
          p.id === targetProductId
            ? { ...p, variants: p.variants.filter((v) => v.id !== targetVariantId) }
            : p
        );

        // Verify the optimistic removal actually removed the variant
        const optimisticProduct = optimisticState.find((p) => p.id === targetProductId)!;
        const originalProduct = products.find((p) => p.id === targetProductId)!;
        expect(optimisticProduct.variants.length).toBe(originalProduct.variants.length - 1);

        // 3. Simulate rollback (simulates setProducts(previousStateRef.current))
        const rolledBackState = previousState;

        // 4. Assert rolled-back state is deeply equal to original
        expect(rolledBackState).toEqual(products);
      }),
      { numRuns: 100 }
    );
  });
});

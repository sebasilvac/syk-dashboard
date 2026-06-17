import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateStockAvailability } from '@/lib/stockValidation';

/**
 * Feature: syk-dashboard-ui, Property 9: Validación de stock insuficiente
 *
 * Para cualquier línea de producto donde quantity > variant.stock,
 * el sistema SHALL señalar stock insuficiente para esa variante específica.
 *
 * **Validates: Requirements 8.5**
 */
describe('Feature: syk-dashboard-ui, Property 9: Validación de stock insuficiente', () => {
  // Generator: a variant with known stock
  const arbVariant = fc.record({
    id: fc.uuid(),
    size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
    color: fc.constantFrom('Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'),
    stock: fc.integer({ min: 0, max: 500 }),
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
   * Generates products and lines where some quantities exceed stock (insufficient)
   * and some do not. Returns products plus categorized lines.
   */
  const arbProductsWithMixedLines = arbProducts
    .filter((products) => products.some((p) => p.variants.length > 0))
    .chain((products) => {
      // Collect all valid product-variant pairs
      const pairs: Array<{ productId: string; variantId: string; stock: number }> = [];
      for (const product of products) {
        for (const variant of product.variants) {
          pairs.push({ productId: product.id, variantId: variant.id, stock: variant.stock });
        }
      }

      if (pairs.length === 0) {
        return fc.constant({
          products,
          insufficientLines: [] as Array<{ productId: string; variantId: string; quantity: number }>,
          sufficientLines: [] as Array<{ productId: string; variantId: string; quantity: number }>,
        });
      }

      // Generate lines that EXCEED stock (insufficient)
      const arbInsufficientLines = fc.array(
        fc.nat({ max: pairs.length - 1 }).chain((idx) => {
          const pair = pairs[idx]!;
          // quantity > stock (at least stock + 1)
          return fc.integer({ min: pair.stock + 1, max: pair.stock + 500 }).map((quantity) => ({
            productId: pair.productId,
            variantId: pair.variantId,
            quantity,
          }));
        }),
        { minLength: 1, maxLength: Math.min(pairs.length, 5) }
      ).map((lines) => {
        // Deduplicate by variantId (keep first occurrence)
        const seen = new Set<string>();
        return lines.filter((line) => {
          if (seen.has(line.variantId)) return false;
          seen.add(line.variantId);
          return true;
        });
      });

      // Generate lines that DO NOT exceed stock (sufficient)
      const pairsWithPositiveStock = pairs.filter((p) => p.stock >= 1);
      const arbSufficientLines = pairsWithPositiveStock.length > 0
        ? fc.array(
            fc.nat({ max: pairsWithPositiveStock.length - 1 }).chain((idx) => {
              const pair = pairsWithPositiveStock[idx]!;
              return fc.integer({ min: 1, max: pair.stock }).map((quantity) => ({
                productId: pair.productId,
                variantId: pair.variantId,
                quantity,
              }));
            }),
            { minLength: 0, maxLength: Math.min(pairsWithPositiveStock.length, 3) }
          ).map((lines) => {
            const seen = new Set<string>();
            return lines.filter((line) => {
              if (seen.has(line.variantId)) return false;
              seen.add(line.variantId);
              return true;
            });
          })
        : fc.constant([] as Array<{ productId: string; variantId: string; quantity: number }>);

      return fc.tuple(arbInsufficientLines, arbSufficientLines).map(
        ([insufficientLines, sufficientLines]) => {
          // Remove sufficient lines that conflict with insufficient lines (same variantId)
          const insufficientVariantIds = new Set(insufficientLines.map((l) => l.variantId));
          const filteredSufficient = sufficientLines.filter(
            (l) => !insufficientVariantIds.has(l.variantId)
          );
          return { products, insufficientLines, sufficientLines: filteredSufficient };
        }
      );
    });

  it('a warning is generated for each line where quantity > stock', () => {
    fc.assert(
      fc.property(arbProductsWithMixedLines, ({ products, insufficientLines, sufficientLines }) => {
        const allLines = [...insufficientLines, ...sufficientLines];
        const warnings = validateStockAvailability(products, allLines);

        // Every insufficient line should have a corresponding warning
        for (const line of insufficientLines) {
          const warning = warnings.find(
            (w) => w.variantId === line.variantId && w.productId === line.productId
          );
          expect(warning).toBeDefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('no warning is generated for lines where quantity <= stock', () => {
    fc.assert(
      fc.property(arbProductsWithMixedLines, ({ products, insufficientLines, sufficientLines }) => {
        const allLines = [...insufficientLines, ...sufficientLines];
        const warnings = validateStockAvailability(products, allLines);

        // No sufficient line should have a warning
        for (const line of sufficientLines) {
          const warning = warnings.find(
            (w) => w.variantId === line.variantId && w.productId === line.productId
          );
          expect(warning).toBeUndefined();
        }
      }),
      { numRuns: 100 }
    );
  });

  it('warnings contain exact info (variantId, productId, requested, available)', () => {
    fc.assert(
      fc.property(arbProductsWithMixedLines, ({ products, insufficientLines, sufficientLines }) => {
        const allLines = [...insufficientLines, ...sufficientLines];
        const warnings = validateStockAvailability(products, allLines);

        for (const line of insufficientLines) {
          const warning = warnings.find(
            (w) => w.variantId === line.variantId && w.productId === line.productId
          );
          expect(warning).toBeDefined();

          // Verify exact fields
          expect(warning!.variantId).toBe(line.variantId);
          expect(warning!.productId).toBe(line.productId);
          expect(warning!.requested).toBe(line.quantity);

          // Find the actual stock from products to verify `available`
          const product = products.find((p) => p.id === line.productId);
          const variant = product!.variants.find((v) => v.id === line.variantId);
          expect(warning!.available).toBe(variant!.stock);
        }
      }),
      { numRuns: 100 }
    );
  });
});

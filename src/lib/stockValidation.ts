import type { Product } from '@/types/models';

export interface StockDeductionItem {
  variantId: string;
  quantity: number;
}

export interface StockWarning {
  variantId: string;
  productId: string;
  requested: number;
  available: number;
}

/**
 * Returns a new array of products with stock decremented for the given items.
 * Does NOT mutate the original products array.
 */
export function deductStock(
  products: ReadonlyArray<Product>,
  items: ReadonlyArray<StockDeductionItem>
): Product[] {
  return products.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => {
      const item = items.find((i) => i.variantId === variant.id);
      if (item) {
        return { ...variant, stock: variant.stock - item.quantity };
      }
      return variant;
    }),
  }));
}

/**
 * Validates whether all requested quantities are available in stock.
 * Returns an array of warnings for variants with insufficient stock.
 */
export function validateStockAvailability(
  products: ReadonlyArray<Product>,
  lines: ReadonlyArray<{ productId: string; variantId: string; quantity: number }>
): StockWarning[] {
  const warnings: StockWarning[] = [];

  for (const line of lines) {
    const product = products.find((p) => p.id === line.productId);
    if (!product) continue;

    const variant = product.variants.find((v) => v.id === line.variantId);
    if (!variant) continue;

    if (line.quantity > variant.stock) {
      warnings.push({
        variantId: line.variantId,
        productId: line.productId,
        requested: line.quantity,
        available: variant.stock,
      });
    }
  }

  return warnings;
}

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product, Variant } from '@/types/models';
import * as productQueries from '@/lib/queries/products';
import { mapProduct, mapVariant, type ProductRow, type VariantRow } from '@/lib/queries/mappers';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';

export interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  updateVariantStock: (variantId: string, stock: number) => Promise<void>;
  addVariant: (productId: string, variant: Omit<Variant, 'id'>) => Promise<void>;
  createProduct: (name: string, category: string, variants: Omit<Variant, 'id'>[]) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  deleteVariant: (productId: string, variantId: string) => Promise<void>;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousStateRef = useRef<Product[]>([]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await productQueries.getProducts();
      setProducts(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Optimistic stock update with rollback
  const updateVariantStock = useCallback(async (variantId: string, stock: number) => {
    previousStateRef.current = products;
    setProducts(prev =>
      prev.map(product => ({
        ...product,
        variants: product.variants.map(v =>
          v.id === variantId ? { ...v, stock } : v
        ),
      }))
    );

    try {
      const updatedVariant = await productQueries.updateVariantStock(variantId, stock);
      setProducts(prev =>
        prev.map(product => ({
          ...product,
          variants: product.variants.map(v =>
            v.id === updatedVariant.id ? updatedVariant : v
          ),
        }))
      );
    } catch (e) {
      setProducts(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error updating variant stock');
    }
  }, [products]);

  // Optimistic variant addition with rollback
  const addVariant = useCallback(async (productId: string, variant: Omit<Variant, 'id'>) => {
    const optimisticVariant: Variant = { ...variant, id: crypto.randomUUID() };
    previousStateRef.current = products;
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, variants: [...product.variants, optimisticVariant] }
          : product
      )
    );

    try {
      const created = await productQueries.addVariant(productId, variant);
      setProducts(prev =>
        prev.map(product =>
          product.id === productId
            ? {
                ...product,
                variants: product.variants.map(v =>
                  v.id === optimisticVariant.id ? created : v
                ),
              }
            : product
        )
      );
    } catch (e) {
      setProducts(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error adding variant');
    }
  }, [products]);

  // Optimistic product creation with rollback
  const createProduct = useCallback(async (name: string, category: string, variants: Omit<Variant, 'id'>[]) => {
    const optimisticProduct: Product = {
      id: crypto.randomUUID(),
      name,
      category,
      variants: variants.map((v) => ({ ...v, id: crypto.randomUUID() })),
    };
    previousStateRef.current = products;
    setProducts(prev => [...prev, optimisticProduct]);

    try {
      const created = await productQueries.createProduct(name, category, variants);
      setProducts(prev =>
        prev.map(p => p.id === optimisticProduct.id ? created : p)
      );
    } catch (e) {
      setProducts(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error creating product');
      throw e;
    }
  }, [products]);

  // Optimistic product deletion with check-first pattern
  const deleteProduct = useCallback(async (productId: string) => {
    // 1. Check references (no optimistic update yet)
    const blockReason = await productQueries.checkProductReferences(productId);
    if (blockReason) {
      setError(blockReason.message);
      throw new Error(blockReason.message);
    }

    // 2. Now apply optimistic removal
    previousStateRef.current = products;
    setProducts(prev => prev.filter(p => p.id !== productId));

    try {
      await productQueries.deleteProduct(productId);
    } catch (e) {
      // 3. Rollback on network failure
      setProducts(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error al eliminar producto');
      throw e;
    }
  }, [products]);

  // Optimistic variant deletion with last-variant guard + check-first pattern
  const deleteVariant = useCallback(async (productId: string, variantId: string) => {
    // 1. Last-variant guard
    const product = products.find(p => p.id === productId);
    if (product && product.variants.length === 1) {
      const msg = 'No se puede eliminar la última variante. Elimina el producto completo en su lugar.';
      setError(msg);
      throw new Error(msg);
    }

    // 2. Check references
    const blockReason = await productQueries.checkVariantReferences(variantId);
    if (blockReason) {
      setError(blockReason.message);
      throw new Error(blockReason.message);
    }

    // 3. Optimistic removal
    previousStateRef.current = products;
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, variants: p.variants.filter(v => v.id !== variantId) }
          : p
      )
    );

    try {
      await productQueries.deleteVariant(variantId);
    } catch (e) {
      setProducts(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error al eliminar variante');
      throw e;
    }
  }, [products]);

  // Real-time subscription on 'products' table
  // When a product changes, re-fetch to get full product with variants
  useRealtimeSubscription('products', {
    onInsert: (record) => {
      const product = mapProduct(record as unknown as ProductRow & { variants: VariantRow[] });
      setProducts(prev => {
        if (prev.some(p => p.id === product.id)) return prev;
        return [...prev, product];
      });
    },
    onUpdate: (record) => {
      const product = mapProduct(record as unknown as ProductRow & { variants: VariantRow[] });
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...product } : p));
    },
    onDelete: (oldRecord) => {
      const id = (oldRecord as { id?: string }).id;
      if (id) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    },
  });

  // Real-time subscription on 'variants' table for stock changes
  useRealtimeSubscription('variants', {
    onInsert: (record) => {
      const variant = mapVariant(record as unknown as VariantRow);
      const productId = (record as { product_id?: string }).product_id;
      if (productId) {
        setProducts(prev =>
          prev.map(p =>
            p.id === productId && !p.variants.some(v => v.id === variant.id)
              ? { ...p, variants: [...p.variants, variant] }
              : p
          )
        );
      }
    },
    onUpdate: (record) => {
      const variant = mapVariant(record as unknown as VariantRow);
      const productId = (record as { product_id?: string }).product_id;
      if (productId) {
        setProducts(prev =>
          prev.map(p =>
            p.id === productId
              ? { ...p, variants: p.variants.map(v => v.id === variant.id ? variant : v) }
              : p
          )
        );
      }
    },
    onDelete: (oldRecord) => {
      const id = (oldRecord as { id?: string }).id;
      const productId = (oldRecord as { product_id?: string }).product_id;
      if (id && productId) {
        setProducts(prev =>
          prev.map(p =>
            p.id === productId
              ? { ...p, variants: p.variants.filter(v => v.id !== id) }
              : p
          )
        );
      }
    },
  });

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    updateVariantStock,
    addVariant,
    createProduct,
    deleteProduct,
    deleteVariant,
  };
}

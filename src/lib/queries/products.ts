import { supabase } from '@/lib/supabase';
import type { Product, Variant } from '@/types/models';
import type { Database } from '@/types/database';
import type { PaginationParams, PaginatedResult } from './shared';
import { handleSupabaseError, paginationRange } from './shared';
import { mapVariant, mapProduct, type VariantRow, type ProductRow } from './mappers';

type VariantInsert = Database['public']['Tables']['variants']['Insert'];
type VariantUpdate = Database['public']['Tables']['variants']['Update'];

export async function getProducts(
  params: PaginationParams = {}
): Promise<PaginatedResult<Product>> {
  const { from, to } = paginationRange(params);

  const { data, error, count } = await supabase
    .from('products')
    .select('*, variants(*)', { count: 'exact' })
    .range(from, to)
    .order('name');

  if (error) handleSupabaseError(error);

  const products = (data ?? []).map((row) =>
    mapProduct(row as unknown as ProductRow & { variants: VariantRow[] })
  );

  return {
    data: products,
    count: count ?? 0,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
  };
}

export async function updateVariantStock(
  variantId: string,
  stock: number
): Promise<Variant> {
  const updatePayload: VariantUpdate = { stock };

  const { data, error } = await supabase
    .from('variants')
    .update(updatePayload)
    .eq('id', variantId)
    .select('id, product_id, size, color, stock, min_stock')
    .single();

  if (error) handleSupabaseError(error);
  return mapVariant(data as unknown as VariantRow);
}

export async function addVariant(
  productId: string,
  variant: Omit<Variant, 'id'>
): Promise<Variant> {
  const insertPayload: VariantInsert = {
    product_id: productId,
    size: variant.size,
    color: variant.color,
    stock: variant.stock,
    min_stock: variant.minStock,
  };

  const { data, error } = await supabase
    .from('variants')
    .insert(insertPayload)
    .select('id, product_id, size, color, stock, min_stock')
    .single();

  if (error) handleSupabaseError(error);
  return mapVariant(data as unknown as VariantRow);
}

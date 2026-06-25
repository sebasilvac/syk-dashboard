import { supabase } from '@/lib/supabase';
import type { Product, Variant } from '@/types/models';
import type { Database } from '@/types/database';
import type { PaginationParams, PaginatedResult } from './shared';
import { handleSupabaseError, paginationRange } from './shared';
import { mapVariant, mapProduct, type VariantRow, type ProductRow } from './mappers';

export interface DeletionBlockReason {
  type: 'active_order' | 'pending_quotation' | 'last_variant';
  message: string;
}

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

export async function createProduct(
  name: string,
  category: string,
  variants: Omit<Variant, 'id'>[]
): Promise<Product> {
  // Insert product row
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert({ name, category })
    .select('id, name, category, created_at, updated_at')
    .single();

  if (productError) handleSupabaseError(productError);

  const productId = (productData as unknown as ProductRow).id;

  // Batch-insert all variants with the new product_id
  const variantPayloads: VariantInsert[] = variants.map((v) => ({
    product_id: productId,
    size: v.size,
    color: v.color,
    stock: v.stock,
    min_stock: v.minStock,
  }));

  const { data: variantData, error: variantError } = await supabase
    .from('variants')
    .insert(variantPayloads)
    .select('id, product_id, size, color, stock, min_stock');

  if (variantError) handleSupabaseError(variantError);

  // Map to domain model using mapProduct
  const productRow = productData as unknown as ProductRow & { variants: VariantRow[] };
  productRow.variants = (variantData ?? []) as unknown as VariantRow[];

  return mapProduct(productRow);
}

export async function checkProductReferences(
  productId: string
): Promise<DeletionBlockReason | null> {
  // Get all variant IDs for this product
  const { data: variants } = await supabase
    .from('variants')
    .select('id')
    .eq('product_id', productId);

  const variantIds = (variants ?? []).map((v) => v.id);
  if (variantIds.length === 0) return null;

  // Check active orders
  const { data: activeOrderLines } = await supabase
    .from('order_lines')
    .select('id, orders!inner(status)')
    .in('variant_id', variantIds)
    .eq('orders.status', 'activo')
    .limit(1);

  if (activeOrderLines && activeOrderLines.length > 0) {
    return {
      type: 'active_order',
      message:
        'No se puede eliminar: este producto está referenciado en pedidos activos.',
    };
  }

  // Check pending quotations
  const { data: pendingQuotationLines } = await supabase
    .from('quotation_lines')
    .select('id, quotations!inner(status)')
    .in('variant_id', variantIds)
    .eq('quotations.status', 'pendiente')
    .limit(1);

  if (pendingQuotationLines && pendingQuotationLines.length > 0) {
    return {
      type: 'pending_quotation',
      message:
        'No se puede eliminar: este producto está referenciado en cotizaciones pendientes.',
    };
  }

  return null;
}

export async function checkVariantReferences(
  variantId: string
): Promise<DeletionBlockReason | null> {
  // Check active orders
  const { data: activeOrderLines } = await supabase
    .from('order_lines')
    .select('id, orders!inner(status)')
    .eq('variant_id', variantId)
    .eq('orders.status', 'activo')
    .limit(1);

  if (activeOrderLines && activeOrderLines.length > 0) {
    return {
      type: 'active_order',
      message:
        'No se puede eliminar: esta variante está referenciada en pedidos activos.',
    };
  }

  // Check pending quotations
  const { data: pendingQuotationLines } = await supabase
    .from('quotation_lines')
    .select('id, quotations!inner(status)')
    .eq('variant_id', variantId)
    .eq('quotations.status', 'pendiente')
    .limit(1);

  if (pendingQuotationLines && pendingQuotationLines.length > 0) {
    return {
      type: 'pending_quotation',
      message:
        'No se puede eliminar: esta variante está referenciada en cotizaciones pendientes.',
    };
  }

  return null;
}

export async function deleteProduct(productId: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) handleSupabaseError(error);
}

export async function deleteVariant(variantId: string): Promise<void> {
  const { error } = await supabase
    .from('variants')
    .delete()
    .eq('id', variantId);

  if (error) handleSupabaseError(error);
}

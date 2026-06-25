import { supabase } from '@/lib/supabase';
import type { Quotation } from '@/types/models';
import type { Database } from '@/types/database';
import type { PaginationParams, PaginatedResult } from './shared';
import { handleSupabaseError, paginationRange } from './shared';
import { mapQuotationLine, type QuotationLineRow } from './mappers';

type QuotationRow = Database['public']['Tables']['quotations']['Row'];
type QuotationLineInsert = Database['public']['Tables']['quotation_lines']['Insert'];
type QuotationUpdate = Database['public']['Tables']['quotations']['Update'];

function mapQuotation(
  row: QuotationRow & { quotation_lines: QuotationLineRow[] }
): Quotation {
  return {
    id: row.id,
    number: row.number,
    clientId: row.client_id,
    sellerId: row.seller_id,
    lines: (row.quotation_lines ?? []).map(mapQuotationLine),
    total: row.total,
    status: row.status as Quotation['status'],
    notes: row.notes,
    estimatedDeliveryDate: row.estimated_delivery_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getQuotations(
  params: PaginationParams = {}
): Promise<PaginatedResult<Quotation>> {
  const { from, to } = paginationRange(params);

  const { data, error, count } = await supabase
    .from('quotations')
    .select('*, quotation_lines(*)', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);

  const quotations = (data ?? []).map((row) =>
    mapQuotation(row as unknown as QuotationRow & { quotation_lines: QuotationLineRow[] })
  );

  return {
    data: quotations,
    count: count ?? 0,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
  };
}

export async function createQuotation(
  quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Quotation> {
  // Get current user session to ensure seller_id matches auth.uid()
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user.id;
  const sellerId = currentUserId ?? quotation.sellerId;

  // Generate a unique number if not provided
  const number = quotation.number || `COT-${Date.now().toString(36).toUpperCase()}`;

  // Debug: log what we're sending
  console.log('[createQuotation] session user id:', currentUserId);
  console.log('[createQuotation] seller_id being sent:', sellerId);
  console.log('[createQuotation] number:', number);
  console.log('[createQuotation] session exists:', !!sessionData.session);
  console.log('[createQuotation] access_token exists:', !!sessionData.session?.access_token);

  const insertPayload = {
    number,
    client_id: quotation.clientId,
    seller_id: sellerId,
    total: quotation.total,
    status: quotation.status,
    notes: quotation.notes,
    estimated_delivery_date: quotation.estimatedDeliveryDate ?? null,
  };

  console.log('[createQuotation] full payload:', JSON.stringify(insertPayload));

  const { data, error } = await supabase
    .from('quotations')
    .insert(insertPayload as Database['public']['Tables']['quotations']['Insert'])
    .select('*, quotation_lines(*)')
    .single();

  if (error) {
    console.error('[createQuotation] error:', JSON.stringify(error));
    handleSupabaseError(error);
  }

  // Insert quotation lines if provided
  const quotationId = (data as unknown as QuotationRow).id;
  if (quotation.lines.length > 0) {
    const lineInserts: QuotationLineInsert[] = quotation.lines.map((line) => ({
      quotation_id: quotationId,
      product_id: line.productId,
      variant_id: line.variantId,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      subtotal: line.subtotal,
    }));

    const { error: linesError } = await supabase
      .from('quotation_lines')
      .insert(lineInserts);

    if (linesError) handleSupabaseError(linesError);
  }

  // Re-fetch the complete quotation with lines
  const { data: fullData, error: fetchError } = await supabase
    .from('quotations')
    .select('*, quotation_lines(*)')
    .eq('id', quotationId)
    .single();

  if (fetchError) handleSupabaseError(fetchError);

  return mapQuotation(
    fullData as unknown as QuotationRow & { quotation_lines: QuotationLineRow[] }
  );
}

export async function updateQuotation(
  id: string,
  changes: Partial<Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'lines'>>
): Promise<Quotation> {
  const updatePayload: QuotationUpdate = {};

  if (changes.number !== undefined) updatePayload.number = changes.number;
  if (changes.clientId !== undefined) updatePayload.client_id = changes.clientId;
  if (changes.sellerId !== undefined) updatePayload.seller_id = changes.sellerId;
  if (changes.total !== undefined) updatePayload.total = changes.total;
  if (changes.status !== undefined) updatePayload.status = changes.status;
  if (changes.notes !== undefined) updatePayload.notes = changes.notes;
  if (changes.estimatedDeliveryDate !== undefined) {
    updatePayload.estimated_delivery_date = changes.estimatedDeliveryDate ?? null;
  }

  const { data, error } = await supabase
    .from('quotations')
    .update(updatePayload as Database['public']['Tables']['quotations']['Update'])
    .eq('id', id)
    .select('*, quotation_lines(*)')
    .single();

  if (error) handleSupabaseError(error);

  return mapQuotation(
    data as unknown as QuotationRow & { quotation_lines: QuotationLineRow[] }
  );
}

export async function approveQuotation(id: string): Promise<Quotation> {
  const { data, error } = await supabase
    .from('quotations')
    .update({ status: 'aprobada' } as QuotationUpdate)
    .eq('id', id)
    .select('*, quotation_lines(*)')
    .single();

  if (error) handleSupabaseError(error);

  return mapQuotation(
    data as unknown as QuotationRow & { quotation_lines: QuotationLineRow[] }
  );
}

export async function rejectQuotation(id: string): Promise<Quotation> {
  const { data, error } = await supabase
    .from('quotations')
    .update({ status: 'rechazada' } as QuotationUpdate)
    .eq('id', id)
    .select('*, quotation_lines(*)')
    .single();

  if (error) handleSupabaseError(error);

  return mapQuotation(
    data as unknown as QuotationRow & { quotation_lines: QuotationLineRow[] }
  );
}

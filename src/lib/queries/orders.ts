import { supabase } from '@/lib/supabase';
import type { Order, Deposit } from '@/types/models';
import type { Database } from '@/types/database';
import type { PaginationParams, PaginatedResult } from './shared';
import { handleSupabaseError, paginationRange } from './shared';
import { mapOrderLine, mapDeposit, type OrderLineRow, type DepositRow } from './mappers';

type OrderRow = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderUpdate = Database['public']['Tables']['orders']['Update'];
type OrderLineInsert = Database['public']['Tables']['order_lines']['Insert'];
type DepositInsert = Database['public']['Tables']['deposits']['Insert'];

function mapOrder(
  row: OrderRow & { order_lines: OrderLineRow[]; deposits: DepositRow[] }
): Order {
  return {
    id: row.id,
    number: row.number,
    clientId: row.client_id,
    sellerId: row.seller_id,
    lines: (row.order_lines ?? []).map(mapOrderLine),
    total: row.total,
    status: row.status as Order['status'],
    notes: row.notes,
    dueDate: row.due_date,
    quotationId: row.quotation_id ?? undefined,
    deposits: (row.deposits ?? []).map(mapDeposit),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getOrders(
  params: PaginationParams = {}
): Promise<PaginatedResult<Order>> {
  const { from, to } = paginationRange(params);

  const { data, error, count } = await supabase
    .from('orders')
    .select('*, order_lines(*), deposits(*)', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });

  if (error) handleSupabaseError(error);

  const orders = (data ?? []).map((row) =>
    mapOrder(row as unknown as OrderRow & { order_lines: OrderLineRow[]; deposits: DepositRow[] })
  );

  return {
    data: orders,
    count: count ?? 0,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 50,
  };
}

export async function createOrder(
  order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'deposits'>
): Promise<Order> {
  // Get current user session to ensure seller_id matches auth.uid()
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUserId = sessionData.session?.user.id;
  const sellerId = currentUserId ?? order.sellerId;

  // Generate a unique number if not provided
  const number = order.number || `PED-${Date.now().toString(36).toUpperCase()}`;

  const insertPayload: OrderInsert = {
    number,
    client_id: order.clientId,
    seller_id: sellerId,
    total: order.total,
    status: order.status,
    notes: order.notes,
    due_date: order.dueDate,
    quotation_id: order.quotationId ?? null,
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(insertPayload)
    .select('*, order_lines(*), deposits(*)')
    .single();

  if (error) handleSupabaseError(error);

  const orderId = (data as unknown as OrderRow).id;

  // Insert order lines if provided
  if (order.lines.length > 0) {
    const lineInserts: OrderLineInsert[] = order.lines.map((line) => ({
      order_id: orderId,
      product_id: line.productId,
      variant_id: line.variantId,
      quantity: line.quantity,
      unit_price: line.unitPrice,
      subtotal: line.subtotal,
    }));

    const { error: linesError } = await supabase
      .from('order_lines')
      .insert(lineInserts);

    if (linesError) handleSupabaseError(linesError);
  }

  // Re-fetch the complete order with lines and deposits
  const { data: fullData, error: fetchError } = await supabase
    .from('orders')
    .select('*, order_lines(*), deposits(*)')
    .eq('id', orderId)
    .single();

  if (fetchError) handleSupabaseError(fetchError);

  return mapOrder(
    fullData as unknown as OrderRow & { order_lines: OrderLineRow[]; deposits: DepositRow[] }
  );
}

export async function createOrderFromQuotation(
  quotationId: string,
  orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'deposits' | 'quotationId'>
): Promise<Order> {
  return createOrder({
    ...orderData,
    quotationId,
  });
}

export async function markOrderDelivered(id: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'entregado' } as OrderUpdate)
    .eq('id', id)
    .select('*, order_lines(*), deposits(*)')
    .single();

  if (error) handleSupabaseError(error);

  return mapOrder(
    data as unknown as OrderRow & { order_lines: OrderLineRow[]; deposits: DepositRow[] }
  );
}

export async function addDeposit(
  orderId: string,
  deposit: Omit<Deposit, 'id'>
): Promise<Deposit> {
  const insertPayload: DepositInsert = {
    order_id: orderId,
    amount: deposit.amount,
    method: deposit.method,
    date: deposit.date,
  };

  const { data, error } = await supabase
    .from('deposits')
    .insert(insertPayload)
    .select()
    .single();

  if (error) handleSupabaseError(error);

  return mapDeposit(data as unknown as DepositRow);
}

export async function removeDeposit(depositId: string): Promise<void> {
  const { error } = await supabase
    .from('deposits')
    .delete()
    .eq('id', depositId);

  if (error) handleSupabaseError(error);
}

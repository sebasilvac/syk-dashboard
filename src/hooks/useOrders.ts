import { useState, useEffect, useCallback, useRef } from 'react';
import type { Order, Deposit } from '@/types/models';
import * as orderQueries from '@/lib/queries/orders';
import { mapOrderLine, mapDeposit, type OrderLineRow, type DepositRow } from '@/lib/queries/mappers';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';
import type { Database } from '@/types/database';

type OrderRow = Database['public']['Tables']['orders']['Row'];

function mapOrderFromRealtime(record: Record<string, unknown>): Order {
  const row = record as unknown as OrderRow & { order_lines?: OrderLineRow[]; deposits?: DepositRow[] };
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

export interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'deposits'>) => Promise<void>;
  createOrderFromQuotation: (quotationId: string, orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'deposits' | 'quotationId'>) => Promise<void>;
  markOrderDelivered: (id: string) => Promise<void>;
  addDeposit: (orderId: string, deposit: Omit<Deposit, 'id'>) => Promise<void>;
  removeDeposit: (orderId: string, depositId: string) => Promise<void>;
}

export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousStateRef = useRef<Order[]>([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderQueries.getOrders();
      setOrders(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Optimistic create
  const createOrder = useCallback(async (input: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'deposits'>) => {
    const now = new Date().toISOString();
    const optimistic: Order = {
      ...input,
      id: crypto.randomUUID(),
      deposits: [],
      createdAt: now,
      updatedAt: now,
    };
    previousStateRef.current = orders;
    setOrders(prev => [...prev, optimistic]);

    try {
      const created = await orderQueries.createOrder(input);
      setOrders(prev => prev.map(o => o.id === optimistic.id ? created : o));
    } catch (e) {
      setOrders(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error creating order');
    }
  }, [orders]);

  // Optimistic create from quotation
  const createOrderFromQuotation = useCallback(async (
    quotationId: string,
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'deposits' | 'quotationId'>
  ) => {
    const now = new Date().toISOString();
    const optimistic: Order = {
      ...orderData,
      id: crypto.randomUUID(),
      quotationId,
      deposits: [],
      createdAt: now,
      updatedAt: now,
    };
    previousStateRef.current = orders;
    setOrders(prev => [...prev, optimistic]);

    try {
      const created = await orderQueries.createOrderFromQuotation(quotationId, orderData);
      setOrders(prev => prev.map(o => o.id === optimistic.id ? created : o));
    } catch (e) {
      setOrders(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error creating order from quotation');
    }
  }, [orders]);

  // Optimistic mark as delivered
  const markOrderDelivered = useCallback(async (id: string) => {
    previousStateRef.current = orders;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'entregado' as const } : o));

    try {
      const updated = await orderQueries.markOrderDelivered(id);
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
    } catch (e) {
      setOrders(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error marking order as delivered');
    }
  }, [orders]);

  // Optimistic add deposit
  const addDeposit = useCallback(async (orderId: string, deposit: Omit<Deposit, 'id'>) => {
    const optimisticDeposit: Deposit = { ...deposit, id: crypto.randomUUID() };
    previousStateRef.current = orders;
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, deposits: [...o.deposits, optimisticDeposit] }
        : o
    ));

    try {
      const created = await orderQueries.addDeposit(orderId, deposit);
      setOrders(prev => prev.map(o =>
        o.id === orderId
          ? { ...o, deposits: o.deposits.map(d => d.id === optimisticDeposit.id ? created : d) }
          : o
      ));
    } catch (e) {
      setOrders(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error adding deposit');
    }
  }, [orders]);

  // Optimistic remove deposit
  const removeDeposit = useCallback(async (orderId: string, depositId: string) => {
    previousStateRef.current = orders;
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, deposits: o.deposits.filter(d => d.id !== depositId) }
        : o
    ));

    try {
      await orderQueries.removeDeposit(depositId);
    } catch (e) {
      setOrders(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error removing deposit');
    }
  }, [orders]);

  // Real-time subscription on 'orders' table
  useRealtimeSubscription('orders', {
    onInsert: (record) => {
      const order = mapOrderFromRealtime(record);
      setOrders(prev => {
        if (prev.some(o => o.id === order.id)) return prev;
        return [...prev, order];
      });
    },
    onUpdate: (record) => {
      const order = mapOrderFromRealtime(record);
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, ...order } : o));
    },
    onDelete: (oldRecord) => {
      const id = (oldRecord as { id?: string }).id;
      if (id) {
        setOrders(prev => prev.filter(o => o.id !== id));
      }
    },
  });

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    createOrderFromQuotation,
    markOrderDelivered,
    addDeposit,
    removeDeposit,
  };
}

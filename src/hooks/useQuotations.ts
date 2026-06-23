import { useState, useEffect, useCallback, useRef } from 'react';
import type { Quotation } from '@/types/models';
import * as quotationQueries from '@/lib/queries/quotations';
import { mapQuotationLine, type QuotationLineRow } from '@/lib/queries/mappers';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';
import type { Database } from '@/types/database';

type QuotationRow = Database['public']['Tables']['quotations']['Row'];

function mapQuotationFromRealtime(record: Record<string, unknown>): Quotation {
  const row = record as unknown as QuotationRow & { quotation_lines?: QuotationLineRow[] };
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

export interface UseQuotationsResult {
  quotations: Quotation[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQuotation: (id: string, changes: Partial<Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'lines'>>) => Promise<void>;
  approveQuotation: (id: string) => Promise<void>;
  rejectQuotation: (id: string) => Promise<void>;
}

export function useQuotations(): UseQuotationsResult {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousStateRef = useRef<Quotation[]>([]);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await quotationQueries.getQuotations();
      setQuotations(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching quotations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Optimistic create
  const createQuotation = useCallback(async (input: Omit<Quotation, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const optimistic: Quotation = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    previousStateRef.current = quotations;
    setQuotations(prev => [...prev, optimistic]);

    try {
      const created = await quotationQueries.createQuotation(input);
      setQuotations(prev => prev.map(q => q.id === optimistic.id ? created : q));
    } catch (e) {
      setQuotations(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error creating quotation');
    }
  }, [quotations]);

  // Optimistic update
  const updateQuotation = useCallback(async (id: string, changes: Partial<Omit<Quotation, 'id' | 'createdAt' | 'updatedAt' | 'lines'>>) => {
    previousStateRef.current = quotations;
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, ...changes } : q));

    try {
      const updated = await quotationQueries.updateQuotation(id, changes);
      setQuotations(prev => prev.map(q => q.id === id ? updated : q));
    } catch (e) {
      setQuotations(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error updating quotation');
    }
  }, [quotations]);

  // Optimistic approve
  const approveQuotation = useCallback(async (id: string) => {
    previousStateRef.current = quotations;
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'aprobada' as const } : q));

    try {
      const updated = await quotationQueries.approveQuotation(id);
      setQuotations(prev => prev.map(q => q.id === id ? updated : q));
    } catch (e) {
      setQuotations(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error approving quotation');
    }
  }, [quotations]);

  // Optimistic reject
  const rejectQuotation = useCallback(async (id: string) => {
    previousStateRef.current = quotations;
    setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'rechazada' as const } : q));

    try {
      const updated = await quotationQueries.rejectQuotation(id);
      setQuotations(prev => prev.map(q => q.id === id ? updated : q));
    } catch (e) {
      setQuotations(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error rejecting quotation');
    }
  }, [quotations]);

  // Real-time subscription on 'quotations' table
  useRealtimeSubscription('quotations', {
    onInsert: (record) => {
      const quotation = mapQuotationFromRealtime(record);
      setQuotations(prev => {
        if (prev.some(q => q.id === quotation.id)) return prev;
        return [...prev, quotation];
      });
    },
    onUpdate: (record) => {
      const quotation = mapQuotationFromRealtime(record);
      setQuotations(prev => prev.map(q => q.id === quotation.id ? { ...q, ...quotation } : q));
    },
    onDelete: (oldRecord) => {
      const id = (oldRecord as { id?: string }).id;
      if (id) {
        setQuotations(prev => prev.filter(q => q.id !== id));
      }
    },
  });

  return {
    quotations,
    loading,
    error,
    refetch: fetchQuotations,
    createQuotation,
    updateQuotation,
    approveQuotation,
    rejectQuotation,
  };
}

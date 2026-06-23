import { useState, useEffect, useCallback, useRef } from 'react';
import type { Client } from '@/types/models';
import * as clientQueries from '@/lib/queries/clients';
import { mapClient, type ClientRow } from '@/lib/queries/mappers';
import { useRealtimeSubscription } from '@/lib/realtime/useRealtimeSubscription';
import { isCacheStale } from '@/lib/queries/shared';

export interface UseClientsResult {
  clients: Client[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  createClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (id: string, changes: Partial<Omit<Client, 'id'>>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previousStateRef = useRef<Client[]>([]);
  const lastFetchedAtRef = useRef<number>(0);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await clientQueries.getClients();
      setClients(result.data);
      lastFetchedAtRef.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error fetching clients');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Cache staleness check — re-fetch if data older than 30s when component re-renders
  useEffect(() => {
    if (lastFetchedAtRef.current === 0) return;

    const interval = setInterval(() => {
      if (isCacheStale(lastFetchedAtRef.current, Date.now())) {
        fetchClients();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchClients]);

  // Optimistic create
  const createClient = useCallback(async (input: Omit<Client, 'id'>) => {
    const optimistic: Client = { ...input, id: crypto.randomUUID() };
    previousStateRef.current = clients;
    setClients(prev => [...prev, optimistic]);

    try {
      const created = await clientQueries.createClient(input);
      setClients(prev => prev.map(c => c.id === optimistic.id ? created : c));
    } catch (e) {
      setClients(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error creating client');
    }
  }, [clients]);

  // Optimistic update
  const updateClient = useCallback(async (id: string, changes: Partial<Omit<Client, 'id'>>) => {
    previousStateRef.current = clients;
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...changes } : c));

    try {
      const updated = await clientQueries.updateClient(id, changes);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
    } catch (e) {
      setClients(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error updating client');
    }
  }, [clients]);

  // Optimistic delete
  const deleteClient = useCallback(async (id: string) => {
    previousStateRef.current = clients;
    setClients(prev => prev.filter(c => c.id !== id));

    try {
      await clientQueries.deleteClient(id);
    } catch (e) {
      setClients(previousStateRef.current);
      setError(e instanceof Error ? e.message : 'Error deleting client');
    }
  }, [clients]);

  // Real-time subscription
  useRealtimeSubscription('clients', {
    onInsert: (record) => {
      const client = mapClient(record as unknown as ClientRow);
      setClients(prev => {
        // Avoid duplicates (e.g., from our own optimistic insert)
        if (prev.some(c => c.id === client.id)) return prev;
        return [...prev, client];
      });
    },
    onUpdate: (record) => {
      const client = mapClient(record as unknown as ClientRow);
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
    },
    onDelete: (oldRecord) => {
      const id = (oldRecord as { id?: string }).id;
      if (id) {
        setClients(prev => prev.filter(c => c.id !== id));
      }
    },
  });

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}

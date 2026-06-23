import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { RECONNECT_CONFIG, getChannelName } from './channels';
import type { RealtimeTable } from './channels';

interface SubscriptionCallbacks {
  onInsert?: (record: Record<string, unknown>) => void;
  onUpdate?: (record: Record<string, unknown>) => void;
  onDelete?: (oldRecord: Record<string, unknown>) => void;
}

export function useRealtimeSubscription(
  table: RealtimeTable,
  callbacks: SubscriptionCallbacks
): void {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retriesRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    let cancelled = false;

    function subscribe(): void {
      const channelName = getChannelName(table);

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table },
          (payload) => {
            callbacksRef.current.onInsert?.(payload.new as Record<string, unknown>);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table },
          (payload) => {
            callbacksRef.current.onUpdate?.(payload.new as Record<string, unknown>);
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table },
          (payload) => {
            callbacksRef.current.onDelete?.(payload.old as Record<string, unknown>);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            retriesRef.current = 0;
          }

          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            handleReconnect();
          }
        });

      channelRef.current = channel;
    }

    function handleReconnect(): void {
      if (cancelled) return;

      if (retriesRef.current >= RECONNECT_CONFIG.maxRetries) {
        return;
      }

      const delay =
        RECONNECT_CONFIG.baseDelay *
        Math.pow(RECONNECT_CONFIG.backoffFactor, retriesRef.current);

      retriesRef.current += 1;

      timeoutRef.current = setTimeout(() => {
        if (cancelled) return;

        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        subscribe();
      }, delay);
    }

    subscribe();

    return () => {
      cancelled = true;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [table]);
}

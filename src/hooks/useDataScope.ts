import { useMemo } from 'react';
import type { AppData } from '@/types/models';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/lib/DataContext';

export function useDataScope(): AppData {
  const { state: authState } = useAuth();
  const { data } = useData();

  return useMemo(() => {
    if (!authState.user || authState.user.role === 'admin') {
      return data;
    }

    // vendedor: filter by sellerId
    const userId = authState.user.id;
    return {
      ...data,
      quotations: data.quotations.filter(q => q.sellerId === userId),
      orders: data.orders.filter(o => o.sellerId === userId),
    };
  }, [authState.user, data]);
}

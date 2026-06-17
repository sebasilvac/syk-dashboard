import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Alert } from '@/types/models';
import { useData } from '@/lib/DataContext';
import { computeAlerts } from '@/lib/computeAlerts';

interface AlertContextValue {
  alerts: Alert[];
  alertCount: number;
}

export const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const { data } = useData();

  const alerts = useMemo(() => computeAlerts(data, new Date()), [data]);
  const alertCount = alerts.length;

  return (
    <AlertContext.Provider value={{ alerts, alertCount }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts(): AlertContextValue {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}

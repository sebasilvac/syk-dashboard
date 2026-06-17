import { createContext, useReducer, useContext } from 'react';
import type { ReactNode } from 'react';
import type { AppData } from '@/types/models';
import type { DataAction } from '@/types/actions';
import { dataReducer } from '@/lib/dataReducer';
import { initialData } from '@/lib/mockData';

interface DataContextValue {
  data: AppData;
  dispatch: React.Dispatch<DataAction>;
}

export const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(dataReducer, initialData);
  return (
    <DataContext.Provider value={{ data, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

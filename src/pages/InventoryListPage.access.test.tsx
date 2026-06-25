import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '@/lib/AuthContext';
import { DataContext } from '@/lib/DataContext';
import type { AuthContextValue } from '@/types/auth';
import type { AppData } from '@/types/models';
import type { DataAction } from '@/types/actions';
import InventoryListPage from '@/pages/InventoryListPage';

/**
 * Integration tests for admin-only access on InventoryListPage.
 * Validates: Requirements 1.1, 1.3
 */

const emptyData: AppData = {
  clients: [],
  products: [],
  quotations: [],
  orders: [],
};

function createAuthValue(role: 'admin' | 'vendedor'): AuthContextValue {
  return {
    state: {
      user: { id: '1', name: 'Test User', role },
      isAuthenticated: true,
      loading: false,
    },
    login: vi.fn(),
    logout: vi.fn(),
  };
}

function renderWithProviders(role: 'admin' | 'vendedor') {
  const authValue = createAuthValue(role);
  const dataValue = { data: emptyData, dispatch: vi.fn() as React.Dispatch<DataAction> };

  return render(
    <AuthContext.Provider value={authValue}>
      <DataContext.Provider value={dataValue}>
        <MemoryRouter>
          <InventoryListPage />
        </MemoryRouter>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}

describe('InventoryListPage - Admin-only access', () => {
  it('"Nuevo Producto" button is visible for admin (Req 1.1)', () => {
    renderWithProviders('admin');

    expect(
      screen.getByRole('button', { name: /nuevo producto/i })
    ).toBeInTheDocument();
  });

  it('"Nuevo Producto" button is hidden for vendedor (Req 1.3)', () => {
    renderWithProviders('vendedor');

    expect(
      screen.queryByRole('button', { name: /nuevo producto/i })
    ).not.toBeInTheDocument();
  });
});

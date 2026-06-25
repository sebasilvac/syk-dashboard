import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AppData } from '@/types/models';
import InventoryDetailPage from '@/pages/InventoryDetailPage';

/**
 * Unit tests for InventoryDetailPage deletion UI.
 * Validates: Requirements 1.1, 1.3, 1.5, 2.1, 2.5, 3.1, 4.1, 5.1
 */

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'product-1' }),
  };
});

const mockDispatch = vi.fn();

const mockData: AppData = {
  clients: [],
  products: [
    {
      id: 'product-1',
      name: 'Camiseta Básica',
      category: 'Ropa',
      variants: [
        { id: 'variant-1', size: 'M', color: 'Negro', stock: 10, minStock: 5 },
        { id: 'variant-2', size: 'L', color: 'Blanco', stock: 20, minStock: 5 },
      ],
    },
  ],
  quotations: [],
  orders: [],
};

vi.mock('@/lib/DataContext', () => ({
  useData: () => ({
    data: mockData,
    dispatch: mockDispatch,
  }),
}));

let mockRole: 'admin' | 'vendedor' = 'admin';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    state: {
      user: { id: '1', name: 'Test', role: mockRole },
      isAuthenticated: true,
      loading: false,
    },
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

const mockCheckProductReferences = vi.fn().mockResolvedValue(null);
const mockCheckVariantReferences = vi.fn().mockResolvedValue(null);

vi.mock('@/lib/queries/products', () => ({
  checkProductReferences: (...args: unknown[]) => mockCheckProductReferences(...args),
  checkVariantReferences: (...args: unknown[]) => mockCheckVariantReferences(...args),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <InventoryDetailPage />
    </MemoryRouter>
  );
}

describe('InventoryDetailPage - Deletion UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRole = 'admin';
    mockCheckProductReferences.mockResolvedValue(null);
    mockCheckVariantReferences.mockResolvedValue(null);
  });

  it('delete product button visible for admin role (Req 1.1)', () => {
    mockRole = 'admin';
    renderPage();

    expect(
      screen.getByRole('button', { name: /eliminar producto/i })
    ).toBeInTheDocument();
  });

  it('delete product button hidden for vendedor role (Req 1.5)', () => {
    mockRole = 'vendedor';
    renderPage();

    expect(
      screen.queryByRole('button', { name: /eliminar producto/i })
    ).not.toBeInTheDocument();
  });

  it('ConfirmDialog shows product name on delete (Req 1.1)', () => {
    mockRole = 'admin';
    renderPage();

    const deleteButton = screen.getByRole('button', { name: /eliminar producto/i });
    fireEvent.click(deleteButton);

    expect(
      screen.getByText(/¿Estás seguro de que deseas eliminar "Camiseta Básica"\?/)
    ).toBeInTheDocument();
  });

  it('delete variant button visible for admin role (Req 2.1)', () => {
    mockRole = 'admin';
    renderPage();

    expect(
      screen.getByRole('button', { name: /eliminar variante M Negro/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /eliminar variante L Blanco/i })
    ).toBeInTheDocument();
  });

  it('delete variant button hidden for vendedor role (Req 2.5)', () => {
    mockRole = 'vendedor';
    renderPage();

    expect(
      screen.queryByRole('button', { name: /eliminar variante M Negro/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /eliminar variante L Blanco/i })
    ).not.toBeInTheDocument();
  });

  it('ConfirmDialog shows variant size/color on variant delete (Req 2.1)', () => {
    mockRole = 'admin';
    renderPage();

    const deleteVariantButton = screen.getByRole('button', { name: /eliminar variante M Negro/i });
    fireEvent.click(deleteVariantButton);

    expect(screen.getByText(/M - Negro/)).toBeInTheDocument();
  });

  it('error message displayed when deletion is blocked (Req 3.1, 4.1, 5.1)', async () => {
    mockRole = 'admin';
    mockCheckProductReferences.mockResolvedValue({
      type: 'active_order',
      message: 'No se puede eliminar: este producto está referenciado en pedidos activos.',
    });

    renderPage();

    const deleteButton = screen.getByRole('button', { name: /eliminar producto/i });
    fireEvent.click(deleteButton);

    // Click confirm in the dialog
    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText('No se puede eliminar: este producto está referenciado en pedidos activos.')
      ).toBeInTheDocument();
    });
  });

  it('navigates to /inventario after product deletion (Req 1.3)', async () => {
    mockRole = 'admin';
    mockCheckProductReferences.mockResolvedValue(null);

    renderPage();

    const deleteButton = screen.getByRole('button', { name: /eliminar producto/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/inventario');
    });
  });
});

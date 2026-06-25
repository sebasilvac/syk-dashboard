import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProductFormPage from '@/pages/ProductFormPage';

/**
 * Unit tests for ProductFormPage component.
 * Validates: Requirements 2.1, 2.3, 2.4, 2.5, 2.6, 2.8, 3.7, 3.8
 */

const mockNavigate = vi.fn();
const mockDispatch = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/lib/DataContext', () => ({
  useData: () => ({
    data: { clients: [], products: [], quotations: [], orders: [] },
    dispatch: mockDispatch,
  }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <ProductFormPage />
    </MemoryRouter>
  );
}

describe('ProductFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders name and category fields (Req 2.1)', () => {
    renderPage();

    expect(screen.getByLabelText('Nombre del Producto')).toBeInTheDocument();
    expect(screen.getByLabelText('Categoría')).toBeInTheDocument();
  });

  it('renders at least one variant row on load (Req 2.3)', () => {
    renderPage();

    expect(screen.getByLabelText('Talla')).toBeInTheDocument();
    expect(screen.getByLabelText('Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Stock')).toBeInTheDocument();
    expect(screen.getByLabelText('Stock Mínimo')).toBeInTheDocument();
  });

  it('"Agregar Variante" adds a new row (Req 2.4)', () => {
    renderPage();

    const addButton = screen.getByRole('button', { name: /agregar variante/i });
    fireEvent.click(addButton);

    const sizeFields = screen.getAllByLabelText('Talla');
    expect(sizeFields).toHaveLength(2);
  });

  it('remove button removes a variant row (Req 2.5)', () => {
    renderPage();

    // Add a second variant so we can remove one
    const addButton = screen.getByRole('button', { name: /agregar variante/i });
    fireEvent.click(addButton);

    const removeButtons = screen.getAllByRole('button', { name: /eliminar variante/i });
    expect(removeButtons).toHaveLength(2);

    fireEvent.click(removeButtons[0]!);

    const sizeFields = screen.getAllByLabelText('Talla');
    expect(sizeFields).toHaveLength(1);
  });

  it('remove button disabled when only one row (Req 2.6)', () => {
    renderPage();

    const removeButton = screen.getByRole('button', { name: /eliminar variante/i });
    expect(removeButton).toBeDisabled();
  });

  it('"Cancelar" navigates to /inventario (Req 2.8)', () => {
    renderPage();

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/inventario');
  });

  it('displays inline errors on validation failure (Req 3.7)', () => {
    renderPage();

    // Submit the form with empty fields
    const submitButton = screen.getByRole('button', { name: /crear producto/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('El nombre del producto es requerido')).toBeInTheDocument();
    expect(screen.getByText('La categoría es requerida')).toBeInTheDocument();
  });

  it('does not call API on validation failure (Req 3.8)', () => {
    renderPage();

    // Submit the form with empty fields (will fail validation)
    const submitButton = screen.getByRole('button', { name: /crear producto/i });
    fireEvent.click(submitButton);

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

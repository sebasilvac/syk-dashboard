import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { parseLocalDate } from '@/lib/computeAlerts';
import { RoleGate } from '@/components/RoleGate';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { Column } from '@/components/DataTable';

interface LineDisplay {
  id: string;
  product: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, dispatch } = useData();
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [dueDate, setDueDate] = useState('');

  const quotation = data.quotations.find((q) => q.id === id);

  const clientName = useMemo(() => {
    if (!quotation) return '';
    return data.clients.find((c) => c.id === quotation.clientId)?.name ?? '—';
  }, [data.clients, quotation]);

  const lineDisplays: LineDisplay[] = useMemo(() => {
    if (!quotation) return [];
    return quotation.lines.map((line) => {
      const product = data.products.find((p) => p.id === line.productId);
      const variant = product?.variants.find((v) => v.id === line.variantId);
      return {
        id: line.id,
        product: product?.name ?? '—',
        variant: variant ? `${variant.size} / ${variant.color}` : '—',
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: line.subtotal,
      };
    });
  }, [quotation, data.products]);

  const lineColumns: Column<LineDisplay>[] = [
    { key: 'product', header: 'Producto' },
    { key: 'variant', header: 'Variante' },
    {
      key: 'quantity',
      header: 'Cantidad',
      render: (l) => <span className="font-mono">{l.quantity}</span>,
    },
    {
      key: 'unitPrice',
      header: 'Precio Unitario',
      render: (l) => <span className="font-mono">${l.unitPrice.toLocaleString('es-CL')}</span>,
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      render: (l) => <span className="font-mono">${l.subtotal.toLocaleString('es-CL')}</span>,
    },
  ];

  // Determine if the current user can convert to order
  const canConvertToOrder = useMemo(() => {
    if (!quotation || quotation.status !== 'aprobada') return false;
    if (!authState.user) return false;
    if (authState.user.role === 'admin') return true;
    // Vendedor can convert their own quotations
    if (authState.user.role === 'vendedor' && quotation.sellerId === authState.user.id) return true;
    return false;
  }, [quotation, authState.user]);

  function handleApprove() {
    if (!quotation) return;
    dispatch({ type: 'QUOTATION_APPROVE', payload: { id: quotation.id } });
  }

  function handleReject() {
    if (!quotation) return;
    dispatch({ type: 'QUOTATION_REJECT', payload: { id: quotation.id } });
  }

  function handleOpenOrderModal() {
    if (!quotation) return;
    // Pre-fill dueDate from estimatedDeliveryDate if available
    setDueDate(quotation.estimatedDeliveryDate ?? '');
    setShowOrderModal(true);
  }

  function handleCreateOrder() {
    if (!quotation || !dueDate) return;
    dispatch({
      type: 'ORDER_CREATE_FROM_QUOTATION',
      payload: { quotationId: quotation.id, dueDate },
    });
    setShowOrderModal(false);
    navigate('/pedidos');
  }

  if (!quotation) {
    return (
      <div className="p-6 md:p-8 max-w-[960px]">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
          <h1 className="text-xl font-semibold text-text-primary">Cotización no encontrada</h1>
          <p className="text-text-muted text-sm">
            La cotización que buscas no existe o fue eliminada.
          </p>
          <Button variant="secondary" onClick={() => navigate('/cotizaciones')}>
            Volver a Cotizaciones
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[960px]">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-mono text-2xl font-bold text-text-primary">{quotation.number}</h1>
          <div className="flex items-center gap-4 text-sm text-text-muted flex-wrap">
            <span className="flex items-center gap-1">{clientName}</span>
            <span className="flex items-center gap-1">
              {new Date(quotation.createdAt).toLocaleDateString('es-CL')}
            </span>
            {quotation.estimatedDeliveryDate && (
              <span className="flex items-center gap-1">
                Entrega estimada: {parseLocalDate(quotation.estimatedDeliveryDate).toLocaleDateString('es-CL')}
              </span>
            )}
            <StatusBadge status={quotation.status} />
          </div>
        </div>
      </div>

      {quotation.notes && (
        <div className="p-4 bg-surface border border-secondary/50 rounded-xl mb-8 text-sm text-text-muted">
          <span className="font-semibold text-text-primary block mb-1">Notas</span>
          {quotation.notes}
        </div>
      )}

      <h2 className="text-lg font-semibold text-text-primary mb-4">Productos</h2>
      <DataTable columns={lineColumns} data={lineDisplays} emptyMessage="Sin líneas de producto" />

      <div className="flex justify-end items-center gap-4 py-4 border-t-2 border-secondary mt-4">
        <span className="text-base font-semibold text-text-primary">Total:</span>
        <span className="font-mono text-xl font-bold text-text-primary">
          ${quotation.total.toLocaleString('es-CL')}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-secondary/50">
        <RoleGate allowedRoles={['admin']}>
          {quotation.status === 'pendiente' && (
            <>
              <Button variant="primary" onClick={handleApprove}>
                Aprobar
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Rechazar
              </Button>
            </>
          )}
        </RoleGate>
        {canConvertToOrder && (
          <Button variant="primary" onClick={handleOpenOrderModal}>
            Crear Pedido
          </Button>
        )}
        <Button variant="ghost" onClick={() => navigate('/cotizaciones')}>
          Volver
        </Button>
      </div>

      <Modal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Crear Pedido desde Cotización"
      >
        <div className="flex flex-col gap-2 mb-6 p-4 bg-bg-secondary border border-secondary/50 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Cliente</span>
            <span className="text-sm font-semibold text-text-primary">{clientName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Líneas de producto</span>
            <span className="text-sm font-semibold text-text-primary">{quotation.lines.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Total</span>
            <span className="text-sm font-semibold text-text-primary font-mono">
              ${quotation.total.toLocaleString('es-CL')}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 mb-6">
          <label className="font-medium text-sm text-text-primary" htmlFor="due-date-input">
            Fecha de Entrega *
          </label>
          <input
            id="due-date-input"
            type="date"
            className="w-full px-3 py-2 bg-bg-secondary border border-secondary rounded-xl font-mono text-sm text-text-primary focus:border-accent focus:shadow-glow focus:outline-none transition-all duration-150"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          {!dueDate && (
            <span className="text-xs text-destructive">
              La fecha de entrega es requerida
            </span>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={() => setShowOrderModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateOrder} disabled={!dueDate}>
            Confirmar Pedido
          </Button>
        </div>
      </Modal>
    </div>
  );
}

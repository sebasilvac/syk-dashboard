import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { parseLocalDate } from '@/lib/computeAlerts';
import { RoleGate } from '@/components/RoleGate';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/Button';
import { DepositSection } from '@/components/DepositSection';
import type { Column } from '@/components/DataTable';
import type { Deposit } from '@/types/models';

interface LineDisplay {
  id: string;
  product: string;
  variant: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, dispatch } = useData();
  const navigate = useNavigate();

  const order = data.orders.find((o) => o.id === id);

  const clientName = useMemo(() => {
    if (!order) return '';
    return data.clients.find((c) => c.id === order.clientId)?.name ?? '—';
  }, [data.clients, order]);

  const lineDisplays: LineDisplay[] = useMemo(() => {
    if (!order) return [];
    return order.lines.map((line) => {
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
  }, [order, data.products]);

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

  function handleMarkDelivered() {
    if (!order) return;
    dispatch({ type: 'ORDER_MARK_DELIVERED', payload: { id: order.id } });
  }

  function handleAddDeposit(deposit: Omit<Deposit, 'id'>) {
    if (!order) return;
    dispatch({ type: 'DEPOSIT_ADD', payload: { orderId: order.id, deposit } });
  }

  function handleRemoveDeposit(depositId: string) {
    if (!order) return;
    dispatch({ type: 'DEPOSIT_REMOVE', payload: { orderId: order.id, depositId } });
  }

  if (!order) {
    return (
      <div className="p-6 md:p-8 max-w-[960px]">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
          <h1 className="text-xl font-semibold text-text-primary">Pedido no encontrado</h1>
          <p className="text-text-muted text-sm">
            El pedido que buscas no existe o fue eliminado.
          </p>
          <Button variant="secondary" onClick={() => navigate('/pedidos')}>
            Volver a Pedidos
          </Button>
        </div>
      </div>
    );
  }

  const isDelivered = order.status === 'entregado';

  return (
    <div className="p-6 md:p-8 max-w-[960px]">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-mono text-2xl font-bold text-text-primary">{order.number}</h1>
          <div className="flex items-center gap-4 text-sm text-text-muted flex-wrap">
            <span className="flex items-center gap-1">{clientName}</span>
            <span className="flex items-center gap-1">
              Creado: {new Date(order.createdAt).toLocaleDateString('es-CL')}
            </span>
            <span className="flex items-center gap-1">
              Entrega: {parseLocalDate(order.dueDate).toLocaleDateString('es-CL')}
            </span>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {order.quotationId && (
        <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-success-muted border border-success/20 rounded-xl">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-accent">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <Link to={`/cotizaciones/${order.quotationId}`} className="text-sm font-medium text-accent hover:underline transition-colors duration-150">
            Ver cotización de origen
          </Link>
        </div>
      )}

      {order.notes && (
        <div className="p-4 bg-surface border border-secondary/50 rounded-xl mb-8 text-sm text-text-muted">
          <span className="font-semibold text-text-primary block mb-1">Notas</span>
          {order.notes}
        </div>
      )}

      <h2 className="text-lg font-semibold text-text-primary mb-4">Productos</h2>
      <DataTable columns={lineColumns} data={lineDisplays} emptyMessage="Sin líneas de producto" />

      <div className="flex justify-end items-center gap-4 py-4 border-t-2 border-secondary mt-4">
        <span className="text-base font-semibold text-text-primary">Total:</span>
        <span className="font-mono text-xl font-bold text-text-primary">
          ${order.total.toLocaleString('es-CL')}
        </span>
      </div>

      <DepositSection
        order={order}
        onAdd={handleAddDeposit}
        onRemove={handleRemoveDeposit}
        isDelivered={isDelivered}
      />

      <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-secondary/50">
        <RoleGate allowedRoles={['admin']}>
          {order.status === 'activo' && (
            <Button variant="primary" onClick={handleMarkDelivered} disabled={isDelivered}>
              Marcar Entregado
            </Button>
          )}
        </RoleGate>
        <Button variant="ghost" onClick={() => navigate('/pedidos')}>
          Volver
        </Button>
      </div>
    </div>
  );
}

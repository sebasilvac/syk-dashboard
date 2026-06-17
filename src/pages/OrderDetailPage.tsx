import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { RoleGate } from '@/components/RoleGate';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/Button';
import type { Column } from '@/components/DataTable';
import './OrderDetailPage.css';

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

  if (!order) {
    return (
      <div className="order-detail">
        <div className="order-detail__not-found">
          <h1 className="order-detail__not-found-title">Pedido no encontrado</h1>
          <p className="order-detail__not-found-text">
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
    <div className="order-detail">
      <div className="order-detail__header">
        <div className="order-detail__header-info">
          <h1 className="order-detail__number">{order.number}</h1>
          <div className="order-detail__meta">
            <span className="order-detail__meta-item">{clientName}</span>
            <span className="order-detail__meta-item">
              Creado: {new Date(order.createdAt).toLocaleDateString('es-CL')}
            </span>
            <span className="order-detail__meta-item">
              Entrega: {new Date(order.dueDate).toLocaleDateString('es-CL')}
            </span>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {order.quotationId && (
        <div className="order-detail__quotation-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <Link to={`/cotizaciones/${order.quotationId}`} className="order-detail__quotation-link-text">
            Ver cotización de origen
          </Link>
        </div>
      )}

      {order.notes && (
        <div className="order-detail__notes">
          <span className="order-detail__notes-label">Notas</span>
          {order.notes}
        </div>
      )}

      <h2 className="order-detail__lines-title">Productos</h2>
      <DataTable columns={lineColumns} data={lineDisplays} emptyMessage="Sin líneas de producto" />

      <div className="order-detail__total">
        <span className="order-detail__total-label">Total:</span>
        <span className="order-detail__total-value">
          ${order.total.toLocaleString('es-CL')}
        </span>
      </div>

      <div className="order-detail__actions">
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

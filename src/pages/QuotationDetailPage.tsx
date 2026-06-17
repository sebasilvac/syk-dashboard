import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { RoleGate } from '@/components/RoleGate';
import { StatusBadge } from '@/components/StatusBadge';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { Column } from '@/components/DataTable';
import './QuotationDetailPage.css';

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

  function handleApprove() {
    if (!quotation) return;
    dispatch({ type: 'QUOTATION_APPROVE', payload: { id: quotation.id } });
  }

  function handleReject() {
    if (!quotation) return;
    dispatch({ type: 'QUOTATION_REJECT', payload: { id: quotation.id } });
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
      <div className="quotation-detail">
        <div className="quotation-detail__not-found">
          <h1 className="quotation-detail__not-found-title">Cotización no encontrada</h1>
          <p className="quotation-detail__not-found-text">
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
    <div className="quotation-detail">
      <div className="quotation-detail__header">
        <div className="quotation-detail__header-info">
          <h1 className="quotation-detail__number">{quotation.number}</h1>
          <div className="quotation-detail__meta">
            <span className="quotation-detail__meta-item">{clientName}</span>
            <span className="quotation-detail__meta-item">
              {new Date(quotation.createdAt).toLocaleDateString('es-CL')}
            </span>
            <StatusBadge status={quotation.status} />
          </div>
        </div>
      </div>

      {quotation.notes && (
        <div className="quotation-detail__notes">
          <span className="quotation-detail__notes-label">Notas</span>
          {quotation.notes}
        </div>
      )}

      <h2 className="quotation-detail__lines-title">Productos</h2>
      <DataTable columns={lineColumns} data={lineDisplays} emptyMessage="Sin líneas de producto" />

      <div className="quotation-detail__total">
        <span className="quotation-detail__total-label">Total:</span>
        <span className="quotation-detail__total-value">
          ${quotation.total.toLocaleString('es-CL')}
        </span>
      </div>

      <div className="quotation-detail__actions">
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
          {quotation.status === 'aprobada' && (
            <Button variant="primary" onClick={() => setShowOrderModal(true)}>
              Crear Pedido
            </Button>
          )}
        </RoleGate>
        <Button variant="ghost" onClick={() => navigate('/cotizaciones')}>
          Volver
        </Button>
      </div>

      <Modal
        open={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Crear Pedido desde Cotización"
      >
        <div className="quotation-detail__due-date-field">
          <label className="quotation-detail__due-date-label" htmlFor="due-date-input">
            Fecha de Entrega
          </label>
          <input
            id="due-date-input"
            type="date"
            className="quotation-detail__due-date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="quotation-detail__modal-actions">
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

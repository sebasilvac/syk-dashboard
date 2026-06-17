import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataScope } from '@/hooks/useDataScope';
import { filterByStatus } from '@/lib/filterByStatus';
import { DataTable } from '@/components/DataTable';
import { StatusFilter } from '@/components/StatusFilter';
import { StatusBadge } from '@/components/StatusBadge';
import { DueDateIndicator } from '@/components/DueDateIndicator';
import { Button } from '@/components/Button';
import type { Column } from '@/components/DataTable';
import type { Order } from '@/types/models';
import './OrderListPage.css';

const STATUS_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'entregado', label: 'Entregado' },
];

export default function OrderListPage() {
  const data = useDataScope();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');

  const filteredOrders = useMemo(() => {
    return filterByStatus(data.orders, statusFilter);
  }, [data.orders, statusFilter]);

  const clientMap = useMemo(
    () => new Map(data.clients.map((c) => [c.id, c.name])),
    [data.clients]
  );

  const columns: Column<Order>[] = [
    {
      key: 'number',
      header: 'Número',
      render: (o) => <span className="font-mono">{o.number}</span>,
    },
    {
      key: 'clientId',
      header: 'Cliente',
      render: (o) => clientMap.get(o.clientId) ?? '—',
    },
    {
      key: 'createdAt',
      header: 'Fecha Creación',
      render: (o) => new Date(o.createdAt).toLocaleDateString('es-CL'),
    },
    {
      key: 'dueDate',
      header: 'Fecha Entrega',
      render: (o) => (
        <span className="order-list__due-cell">
          {new Date(o.dueDate).toLocaleDateString('es-CL')}
          {o.status === 'activo' && <DueDateIndicator dueDate={o.dueDate} />}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      render: (o) => (
        <span className="order-list__total">
          ${o.total.toLocaleString('es-CL')}
        </span>
      ),
    },
  ];

  function handleRowClick(order: Order) {
    navigate(`/pedidos/${order.id}`);
  }

  return (
    <div className="order-list">
      <div className="order-list__header">
        <h1 className="order-list__title">Pedidos</h1>
        <Button variant="primary" onClick={() => navigate('/pedidos/nuevo')}>
          Nuevo Pedido
        </Button>
      </div>

      <div className="order-list__controls">
        <StatusFilter
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredOrders}
        onRowClick={handleRowClick}
        emptyMessage="No se encontraron pedidos"
      />
    </div>
  );
}

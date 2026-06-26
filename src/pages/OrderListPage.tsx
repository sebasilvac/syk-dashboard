import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataScope } from '@/hooks/useDataScope';
import { filterByStatus } from '@/lib/filterByStatus';
import { parseLocalDate } from '@/lib/computeAlerts';
import { Table } from '@/design-system/components/Table';
import { StatusFilter } from '@/components/StatusFilter';
import { StatusBadge } from '@/components/StatusBadge';
import { DueDateIndicator } from '@/components/DueDateIndicator';
import { Button } from '@/design-system/components/Button';
import type { TableColumn } from '@/design-system/components/Table';
import type { Order } from '@/types/models';

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

  const columns: TableColumn<Order>[] = [
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
        <span className="flex items-center gap-1">
          {parseLocalDate(o.dueDate).toLocaleDateString('es-CL')}
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
        <span className="font-mono text-sm whitespace-nowrap">
          ${o.total.toLocaleString('es-CL')}
        </span>
      ),
    },
  ];

  function handleRowClick(order: Order) {
    navigate(`/pedidos/${order.id}`);
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-col sm:flex-row">
        <h1 className="text-2xl font-bold text-text-primary">Pedidos</h1>
        <Button variant="primary" onClick={() => navigate('/pedidos/nuevo')}>
          Nuevo Pedido
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap flex-col sm:flex-row">
        <StatusFilter
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <Table
        columns={columns}
        data={filteredOrders}
        onRowClick={handleRowClick}
        emptyMessage="No se encontraron pedidos"
      />
    </div>
  );
}

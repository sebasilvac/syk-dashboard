import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataScope } from '@/hooks/useDataScope';
import { searchQuotations } from '@/lib/searchFilter';
import { filterByStatus } from '@/lib/filterByStatus';
import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import { StatusFilter } from '@/components/StatusFilter';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/Button';
import type { Column } from '@/components/DataTable';
import type { Quotation } from '@/types/models';

const STATUS_OPTIONS = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'rechazada', label: 'Rechazada' },
];

export default function QuotationListPage() {
  const data = useDataScope();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredQuotations = useMemo(() => {
    const searched = searchQuotations(data.quotations, search, data.clients);
    return filterByStatus(searched, statusFilter);
  }, [data.quotations, data.clients, search, statusFilter]);

  const clientMap = useMemo(
    () => new Map(data.clients.map((c) => [c.id, c.name])),
    [data.clients]
  );

  const columns: Column<Quotation>[] = [
    {
      key: 'number',
      header: 'Número',
      render: (q) => <span className="font-mono">{q.number}</span>,
    },
    {
      key: 'clientId',
      header: 'Cliente',
      render: (q) => clientMap.get(q.clientId) ?? '—',
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (q) => new Date(q.createdAt).toLocaleDateString('es-CL'),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (q) => <StatusBadge status={q.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      render: (q) => (
        <span className="font-mono text-sm whitespace-nowrap">
          ${q.total.toLocaleString('es-CL')}
        </span>
      ),
    },
  ];

  function handleRowClick(quotation: Quotation) {
    navigate(`/cotizaciones/${quotation.id}`);
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-col sm:flex-row">
        <h1 className="text-2xl font-bold text-text-primary">Cotizaciones</h1>
        <Button variant="primary" onClick={() => navigate('/cotizaciones/nueva')}>
          Nueva Cotización
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap flex-col sm:flex-row">
        <div className="flex-1 min-w-[200px] w-full sm:w-auto">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por cliente o número..."
          />
        </div>
        <StatusFilter
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredQuotations}
        onRowClick={handleRowClick}
        emptyMessage="No se encontraron cotizaciones"
      />
    </div>
  );
}

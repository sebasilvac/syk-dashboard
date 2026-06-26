import { useState, useMemo } from 'react';
import { useData } from '@/lib/DataContext';
import { searchFilter } from '@/lib/searchFilter';
import { Table } from '@/design-system/components/Table';
import { SearchBar } from '@/components/SearchBar';
import { Modal } from '@/design-system/components/Modal';
import { ClientForm } from '@/components/ClientForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Button } from '@/design-system/components/Button';
import type { TableColumn } from '@/design-system/components/Table';
import type { Client } from '@/types/models';

export default function ClientListPage() {
  const { data, dispatch } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const filteredClients = useMemo(() => {
    return searchFilter(data.clients, searchQuery, (client) => [
      client.name,
      client.email,
      client.phone,
    ]);
  }, [data.clients, searchQuery]);

  const columns: TableColumn<Client>[] = [
    { key: 'name', header: 'Nombre' },
    { key: 'email', header: 'Correo electrónico' },
    { key: 'phone', header: 'Teléfono' },
    {
      key: 'actions',
      header: 'Acciones',
      render: (client) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="p-1 rounded bg-transparent border-none cursor-pointer text-text-muted hover:text-text-primary hover:bg-surface transition-colors duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setEditingClient(client);
            }}
            aria-label={`Editar ${client.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            className="p-1 rounded bg-transparent border-none cursor-pointer text-destructive hover:bg-destructive-muted transition-colors duration-150"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingClient(client);
            }}
            aria-label={`Eliminar ${client.name}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  function handleCreateClient(clientData: Omit<Client, 'id'>) {
    dispatch({ type: 'CLIENT_CREATE', payload: clientData });
    setShowCreateModal(false);
  }

  function handleUpdateClient(clientData: Omit<Client, 'id'>) {
    if (!editingClient) return;
    dispatch({
      type: 'CLIENT_UPDATE',
      payload: { id: editingClient.id, changes: clientData },
    });
    setEditingClient(null);
  }

  function handleDeleteClient() {
    if (!deletingClient) return;
    dispatch({ type: 'CLIENT_DELETE', payload: { id: deletingClient.id } });
    setDeletingClient(null);
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-primary m-0">Clientes</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Nuevo Cliente
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre, correo o teléfono..."
        />
      </div>

      <Table
        columns={columns}
        data={filteredClients}
        emptyMessage="No se encontraron clientes"
      />

      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nuevo Cliente"
      >
        <ClientForm
          onSave={handleCreateClient}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        open={!!editingClient}
        onClose={() => setEditingClient(null)}
        title="Editar Cliente"
      >
        {editingClient && (
          <ClientForm
            client={editingClient}
            onSave={handleUpdateClient}
            onCancel={() => setEditingClient(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deletingClient}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que deseas eliminar al cliente "${deletingClient?.name ?? ''}"? Esta acción no se puede deshacer.`}
        variant="destructive"
        onConfirm={handleDeleteClient}
        onCancel={() => setDeletingClient(null)}
      />
    </div>
  );
}

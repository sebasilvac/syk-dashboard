import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { searchProducts } from '@/lib/searchFilter';
import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import { LowStockIndicator, hasLowStock } from '@/components/LowStockIndicator';
import type { Column } from '@/components/DataTable';
import type { Product } from '@/types/models';

export default function InventoryListPage() {
  const { data } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return searchProducts(data.products, searchQuery);
  }, [data.products, searchQuery]);

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (p) => (
        <span className="flex items-center gap-2">
          {p.name}
          <LowStockIndicator variants={p.variants} />
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
    },
    {
      key: 'variants',
      header: 'Variantes',
      render: (p) => <span className="font-mono">{p.variants.length}</span>,
    },
    {
      key: 'stock',
      header: 'Stock Total',
      render: (p) => (
        <span className="font-mono">
          {p.variants.reduce((sum, v) => sum + v.stock, 0)}
        </span>
      ),
    },
  ];

  function handleRowClick(product: Product) {
    navigate(`/inventario/${product.id}`);
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-col sm:flex-row">
        <h1 className="text-2xl font-bold text-text-primary">Inventario</h1>
      </div>

      <div className="flex items-center gap-4 mb-6 flex-wrap flex-col sm:flex-row">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nombre o categoría..."
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredProducts}
        onRowClick={handleRowClick}
        rowClassName={(p) => hasLowStock(p.variants) ? 'bg-warning-muted' : ''}
        emptyMessage="No se encontraron productos"
      />
    </div>
  );
}

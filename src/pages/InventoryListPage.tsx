import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { searchProducts } from '@/lib/searchFilter';
import { DataTable } from '@/components/DataTable';
import { SearchBar } from '@/components/SearchBar';
import { LowStockIndicator, hasLowStock } from '@/components/LowStockIndicator';
import type { Column } from '@/components/DataTable';
import type { Product } from '@/types/models';
import './InventoryListPage.css';

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
        <span className="inventory-list__name-cell">
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
    <div className="inventory-list">
      <div className="inventory-list__header">
        <h1 className="inventory-list__title">Inventario</h1>
      </div>

      <div className="inventory-list__controls">
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
        rowClassName={(p) => hasLowStock(p.variants) ? 'inventory-list__row--low-stock' : ''}
        emptyMessage="No se encontraron productos"
      />
    </div>
  );
}

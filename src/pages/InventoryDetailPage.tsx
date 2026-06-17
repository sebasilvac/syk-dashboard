import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { RoleGate } from '@/components/RoleGate';
import { DataTable } from '@/components/DataTable';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';
import type { Column } from '@/components/DataTable';
import './InventoryDetailPage.css';

interface VariantDisplay {
  id: string;
  size: string;
  color: string;
  stock: number;
  minStock: number;
}

interface AddVariantForm {
  size: string;
  color: string;
  stock: string;
  minStock: string;
}

interface FormErrors {
  size?: string;
  color?: string;
}

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, dispatch } = useData();
  const navigate = useNavigate();

  const product = data.products.find((p) => p.id === id);

  const [form, setForm] = useState<AddVariantForm>({
    size: '',
    color: '',
    stock: '0',
    minStock: '5',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});

  const variantDisplays: VariantDisplay[] = useMemo(() => {
    if (!product) return [];
    return product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      stock: v.stock,
      minStock: v.minStock,
    }));
  }, [product]);

  function handleFormChange(field: keyof AddVariantForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validateForm(): boolean {
    const newErrors: FormErrors = {};
    if (!form.size.trim()) {
      newErrors.size = 'La talla es requerida';
    }
    if (!form.color.trim()) {
      newErrors.color = 'El color es requerido';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!product || !validateForm()) return;

    dispatch({
      type: 'VARIANT_ADD',
      payload: {
        productId: product.id,
        variant: {
          size: form.size.trim(),
          color: form.color.trim(),
          stock: Number(form.stock) || 0,
          minStock: Number(form.minStock) || 0,
        },
      },
    });

    setForm({ size: '', color: '', stock: '0', minStock: '5' });
    setErrors({});
  }

  function handleStockEdit(variantId: string, value: string) {
    setEditingStock((prev) => ({ ...prev, [variantId]: value }));
  }

  function handleStockCommit(variantId: string) {
    if (!product) return;
    const value = editingStock[variantId];
    if (value === undefined) return;

    const stockNum = Number(value);
    if (!isNaN(stockNum) && stockNum >= 0) {
      dispatch({
        type: 'VARIANT_UPDATE_STOCK',
        payload: { productId: product.id, variantId, stock: stockNum },
      });
    }
    setEditingStock((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  }

  function handleStockKeyDown(e: React.KeyboardEvent, variantId: string) {
    if (e.key === 'Enter') {
      handleStockCommit(variantId);
    }
  }

  const variantColumns: Column<VariantDisplay>[] = useMemo(() => {
    const base: Column<VariantDisplay>[] = [
      { key: 'size', header: 'Talla' },
      { key: 'color', header: 'Color' },
      {
        key: 'stock',
        header: 'Stock',
        render: (v) => (
          <RoleGate
            allowedRoles={['admin']}
            fallback={
              <span className={`font-mono ${v.stock <= v.minStock ? 'inventory-detail__stock--low' : ''}`}>
                {v.stock}
              </span>
            }
          >
            <input
              type="number"
              className={`inventory-detail__stock-input ${v.stock <= v.minStock ? 'inventory-detail__stock-input--low' : ''}`}
              value={editingStock[v.id] ?? String(v.stock)}
              onChange={(e) => handleStockEdit(v.id, e.target.value)}
              onBlur={() => handleStockCommit(v.id)}
              onKeyDown={(e) => handleStockKeyDown(e, v.id)}
              min="0"
              aria-label={`Stock de ${v.size} ${v.color}`}
            />
          </RoleGate>
        ),
      },
      {
        key: 'minStock',
        header: 'Stock Mínimo',
        render: (v) => <span className="font-mono">{v.minStock}</span>,
      },
    ];
    return base;
  }, [editingStock]);

  if (!product) {
    return (
      <div className="inventory-detail">
        <div className="inventory-detail__not-found">
          <h1 className="inventory-detail__not-found-title">Producto no encontrado</h1>
          <p className="inventory-detail__not-found-text">
            El producto que buscas no existe o fue eliminado.
          </p>
          <Button variant="secondary" onClick={() => navigate('/inventario')}>
            Volver a Inventario
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-detail">
      <div className="inventory-detail__header">
        <div className="inventory-detail__header-info">
          <h1 className="inventory-detail__name">{product.name}</h1>
          <div className="inventory-detail__meta">
            <span className="inventory-detail__meta-item">{product.category}</span>
            <span className="inventory-detail__meta-item">
              {product.variants.length} variante{product.variants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <Button variant="ghost" onClick={() => navigate('/inventario')}>
          Volver
        </Button>
      </div>

      <h2 className="inventory-detail__section-title">Variantes</h2>
      <DataTable
        columns={variantColumns}
        data={variantDisplays}
        emptyMessage="Este producto no tiene variantes"
      />

      <RoleGate allowedRoles={['admin']}>
        <div className="inventory-detail__add-form">
          <h3 className="inventory-detail__form-title">Agregar Variante</h3>
          <form onSubmit={handleAddVariant} className="inventory-detail__form">
            <FormField label="Talla" error={errors.size} htmlFor="variant-size">
              <input
                id="variant-size"
                type="text"
                className="inventory-detail__input"
                value={form.size}
                onChange={(e) => handleFormChange('size', e.target.value)}
                placeholder="Ej: M, L, XL"
              />
            </FormField>

            <FormField label="Color" error={errors.color} htmlFor="variant-color">
              <input
                id="variant-color"
                type="text"
                className="inventory-detail__input"
                value={form.color}
                onChange={(e) => handleFormChange('color', e.target.value)}
                placeholder="Ej: Rojo, Azul"
              />
            </FormField>

            <FormField label="Stock" htmlFor="variant-stock">
              <input
                id="variant-stock"
                type="number"
                className="inventory-detail__input"
                value={form.stock}
                onChange={(e) => handleFormChange('stock', e.target.value)}
                min="0"
              />
            </FormField>

            <FormField label="Stock Mínimo" htmlFor="variant-min-stock">
              <input
                id="variant-min-stock"
                type="number"
                className="inventory-detail__input"
                value={form.minStock}
                onChange={(e) => handleFormChange('minStock', e.target.value)}
                min="0"
              />
            </FormField>

            <div className="inventory-detail__form-actions">
              <Button type="submit" variant="primary">
                Agregar
              </Button>
            </div>
          </form>
        </div>
      </RoleGate>
    </div>
  );
}

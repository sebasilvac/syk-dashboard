import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { RoleGate } from '@/components/RoleGate';
import { Table } from '@/design-system/components/Table';
import { FormField } from '@/design-system/components/FormField';
import { Input } from '@/design-system/components/Input';
import { Button } from '@/design-system/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { inputVariants } from '@/design-system/variants/input';
import { cn } from '@/design-system/utils/cn';
import { checkProductReferences, checkVariantReferences } from '@/lib/queries/products';
import type { TableColumn } from '@/design-system/components/Table';

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

  // Deletion state (Tasks 8.1, 8.2, 8.3)
  const [showDeleteProductDialog, setShowDeleteProductDialog] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<VariantDisplay | null>(null);
  const [deletionError, setDeletionError] = useState<string | null>(null);

  // Clear deletion error after 5 seconds
  useEffect(() => {
    if (!deletionError) return;
    const timer = setTimeout(() => setDeletionError(null), 5000);
    return () => clearTimeout(timer);
  }, [deletionError]);

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

  // Delete product handler
  async function handleDeleteProduct() {
    if (!product) return;
    setDeletionError(null);

    try {
      const blockReason = await checkProductReferences(product.id);
      if (blockReason) {
        setDeletionError(blockReason.message);
        setShowDeleteProductDialog(false);
        return;
      }
      dispatch({ type: 'PRODUCT_DELETE', payload: { id: product.id } });
      navigate('/inventario');
    } catch {
      setDeletionError('Error al eliminar. Intenta nuevamente.');
      setShowDeleteProductDialog(false);
    }
  }

  // Delete variant handler
  async function handleDeleteVariant() {
    if (!product || !variantToDelete) return;
    setDeletionError(null);

    // Last-variant guard
    if (product.variants.length === 1) {
      setDeletionError('No se puede eliminar la última variante. Elimina el producto completo en su lugar.');
      setVariantToDelete(null);
      return;
    }

    try {
      const blockReason = await checkVariantReferences(variantToDelete.id);
      if (blockReason) {
        setDeletionError(blockReason.message);
        setVariantToDelete(null);
        return;
      }
      dispatch({ type: 'VARIANT_DELETE', payload: { productId: product.id, variantId: variantToDelete.id } });
      setVariantToDelete(null);
    } catch {
      setDeletionError('Error al eliminar. Intenta nuevamente.');
      setVariantToDelete(null);
    }
  }

  const variantColumns: TableColumn<VariantDisplay>[] = useMemo(() => {
    const base: TableColumn<VariantDisplay>[] = [
      { key: 'size', header: 'Talla' },
      { key: 'color', header: 'Color' },
      {
        key: 'stock',
        header: 'Stock',
        render: (v) => (
          <RoleGate
            allowedRoles={['admin']}
            fallback={
              <span className={`font-mono ${v.stock <= v.minStock ? 'text-warning font-semibold' : ''}`}>
                {v.stock}
              </span>
            }
          >
            <input
              type="number"
              className={cn(
                inputVariants({ state: v.stock <= v.minStock ? 'error' : 'default' }),
                'w-20 font-mono'
              )}
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
      {
        key: 'actions' as keyof VariantDisplay,
        header: 'Acciones',
        render: (v) => (
          <RoleGate allowedRoles={['admin']}>
            <button
              type="button"
              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/30 transition-colors duration-150"
              onClick={() => setVariantToDelete(v)}
              aria-label={`Eliminar variante ${v.size} ${v.color}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </RoleGate>
        ),
      },
    ];
    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingStock]);

  if (!product) {
    return (
      <div className="p-6 md:p-8 max-w-[960px]">
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center">
          <h1 className="text-xl font-semibold text-text-primary">Producto no encontrado</h1>
          <p className="text-text-muted text-sm">
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
    <div className="p-6 md:p-8 max-w-[960px]">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">{product.name}</h1>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span className="flex items-center gap-1">{product.category}</span>
            <span className="flex items-center gap-1">
              {product.variants.length} variante{product.variants.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleGate allowedRoles={['admin']}>
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteProductDialog(true)}>
              Eliminar Producto
            </Button>
          </RoleGate>
          <Button variant="ghost" onClick={() => navigate('/inventario')}>
            Volver
          </Button>
        </div>
      </div>

      {deletionError && (
        <div
          className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-xl text-sm text-red-200"
          role="alert"
        >
          {deletionError}
        </div>
      )}

      <h2 className="text-lg font-semibold text-text-primary mb-4">Variantes</h2>
      <Table
        columns={variantColumns}
        data={variantDisplays}
        emptyMessage="Este producto no tiene variantes"
      />

      <RoleGate allowedRoles={['admin']}>
        <div className="mt-8 pt-6 border-t border-secondary/50">
          <h3 className="text-base font-semibold text-text-primary mb-4">Agregar Variante</h3>
          <form onSubmit={handleAddVariant} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-start">
            <Input
              label="Talla"
              error={errors.size}
              id="variant-size"
              type="text"
              value={form.size}
              onChange={(e) => handleFormChange('size', e.target.value)}
              placeholder="Ej: M, L, XL"
            />

            <Input
              label="Color"
              error={errors.color}
              id="variant-color"
              type="text"
              value={form.color}
              onChange={(e) => handleFormChange('color', e.target.value)}
              placeholder="Ej: Rojo, Azul"
            />

            <FormField label="Stock" htmlFor="variant-stock">
              <input
                id="variant-stock"
                type="number"
                className={cn(inputVariants({ state: 'default' }))}
                value={form.stock}
                onChange={(e) => handleFormChange('stock', e.target.value)}
                min="0"
              />
            </FormField>

            <FormField label="Stock Mínimo" htmlFor="variant-min-stock">
              <input
                id="variant-min-stock"
                type="number"
                className={cn(inputVariants({ state: 'default' }))}
                value={form.minStock}
                onChange={(e) => handleFormChange('minStock', e.target.value)}
                min="0"
              />
            </FormField>

            <div className="flex items-end pt-6">
              <Button type="submit" variant="primary">
                Agregar
              </Button>
            </div>
          </form>
        </div>
      </RoleGate>

      {/* Delete Product Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteProductDialog}
        title="Eliminar Producto"
        message={`¿Estás seguro de que deseas eliminar "${product.name}"? Todas las variantes asociadas serán eliminadas permanentemente.`}
        variant="destructive"
        onConfirm={handleDeleteProduct}
        onCancel={() => {
          setShowDeleteProductDialog(false);
          setDeletionError(null);
        }}
      />

      {/* Delete Variant Confirmation Dialog */}
      <ConfirmDialog
        open={variantToDelete !== null}
        title="Eliminar Variante"
        message={
          variantToDelete
            ? `¿Estás seguro de que deseas eliminar la variante "${variantToDelete.size} - ${variantToDelete.color}"?`
            : ''
        }
        variant="destructive"
        onConfirm={handleDeleteVariant}
        onCancel={() => {
          setVariantToDelete(null);
          setDeletionError(null);
        }}
      />
    </div>
  );
}

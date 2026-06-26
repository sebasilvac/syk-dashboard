import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/design-system/components/Input';
import { FormField } from '@/design-system/components/FormField';
import { Button } from '@/design-system/components/Button';
import { inputVariants } from '@/design-system/variants/input';
import { cn } from '@/design-system/utils/cn';
import { validateProductForm } from '@/lib/productValidation';
import type { ProductFormData } from '@/lib/productValidation';
import type { ValidationError } from '@/lib/formValidation';
import { useData } from '@/lib/DataContext';

interface VariantRow {
  key: string;
  size: string;
  color: string;
  stock: string;
  minStock: string;
}

interface FormState {
  name: string;
  category: string;
  variants: VariantRow[];
}

function createEmptyVariant(): VariantRow {
  return {
    key: crypto.randomUUID(),
    size: '',
    color: '',
    stock: '0',
    minStock: '0',
  };
}

function getFieldError(errors: ValidationError[], field: string): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { dispatch } = useData();

  const [form, setForm] = useState<FormState>({
    name: '',
    category: '',
    variants: [createEmptyVariant()],
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setForm((prev) => ({ ...prev, name: value }));
  }

  function handleCategoryChange(value: string) {
    setForm((prev) => ({ ...prev, category: value }));
  }

  function handleVariantChange(key: string, field: keyof Omit<VariantRow, 'key'>, value: string) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => (v.key === key ? { ...v, [field]: value } : v)),
    }));
  }

  function handleAddVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
  }

  function handleRemoveVariant(key: string) {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.key !== key),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors([]);
    setServerError(null);

    // Parse numeric fields and build ProductFormData
    const formData: ProductFormData = {
      name: form.name,
      category: form.category,
      variants: form.variants.map((v) => ({
        size: v.size,
        color: v.color,
        stock: parseInt(v.stock, 10) || 0,
        minStock: parseInt(v.minStock, 10) || 0,
      })),
    };

    // Validate
    const validationErrors = validateProductForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit to server
    setSubmitting(true);
    try {
      dispatch({
        type: 'PRODUCT_CREATE',
        payload: {
          name: formData.name,
          category: formData.category,
          variants: formData.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            minStock: v.minStock,
          })),
        },
      });
      navigate('/inventario');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear el producto');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate('/inventario');
  }

  const nameError = getFieldError(errors, 'name');
  const categoryError = getFieldError(errors, 'category');
  const variantsError = getFieldError(errors, 'variants');

  return (
    <div className="p-6 md:p-8 max-w-[960px]">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Crear Producto</h1>

      {serverError && (
        <div className="mb-6 p-4 bg-destructive-muted border border-destructive rounded-xl text-destructive text-sm" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8" noValidate>
        {/* Product fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nombre del Producto"
            id="product-name"
            type="text"
            error={nameError}
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ej: Camiseta Básica"
          />

          <Input
            label="Categoría"
            id="product-category"
            type="text"
            error={categoryError}
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            placeholder="Ej: Ropa, Accesorios"
          />
        </div>

        {/* Variants section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-text-primary">Variantes</h2>

          {variantsError && (
            <p className="text-destructive text-sm" role="alert">{variantsError}</p>
          )}

          {form.variants.map((variant, index) => {
            const sizeError = getFieldError(errors, `variants[${index}].size`);
            const colorError = getFieldError(errors, `variants[${index}].color`);
            const stockError = getFieldError(errors, `variants[${index}].stock`);
            const minStockError = getFieldError(errors, `variants[${index}].minStock`);

            return (
              <div
                key={variant.key}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 items-start p-4 border border-secondary/50 rounded-xl bg-bg-secondary/30"
                role="group"
                aria-label={`Variante ${index + 1}`}
              >
                <Input
                  label="Talla"
                  id={`variant-size-${index}`}
                  type="text"
                  error={sizeError}
                  value={variant.size}
                  onChange={(e) => handleVariantChange(variant.key, 'size', e.target.value)}
                  placeholder="Ej: M, L, XL"
                />

                <Input
                  label="Color"
                  id={`variant-color-${index}`}
                  type="text"
                  error={colorError}
                  value={variant.color}
                  onChange={(e) => handleVariantChange(variant.key, 'color', e.target.value)}
                  placeholder="Ej: Rojo, Azul"
                />

                <FormField label="Stock" htmlFor={`variant-stock-${index}`} error={stockError}>
                  <input
                    id={`variant-stock-${index}`}
                    type="number"
                    className={cn(inputVariants({ state: stockError ? 'error' : 'default' }))}
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(variant.key, 'stock', e.target.value)}
                    min="0"
                    aria-describedby={stockError ? `variant-stock-${index}-error` : undefined}
                    aria-invalid={!!stockError}
                  />
                </FormField>

                <FormField label="Stock Mínimo" htmlFor={`variant-minStock-${index}`} error={minStockError}>
                  <input
                    id={`variant-minStock-${index}`}
                    type="number"
                    className={cn(inputVariants({ state: minStockError ? 'error' : 'default' }))}
                    value={variant.minStock}
                    onChange={(e) => handleVariantChange(variant.key, 'minStock', e.target.value)}
                    min="0"
                    aria-describedby={minStockError ? `variant-minStock-${index}-error` : undefined}
                    aria-invalid={!!minStockError}
                  />
                </FormField>

                <div className="flex items-end pt-6">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveVariant(variant.key)}
                    disabled={form.variants.length === 1}
                    aria-label={`Eliminar variante ${index + 1}`}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            );
          })}

          <div>
            <Button variant="secondary" onClick={handleAddVariant}>
              Agregar Variante
            </Button>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-secondary/50">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Creando...' : 'Crear Producto'}
          </Button>
          <Button variant="ghost" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';
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
          <FormField label="Nombre del Producto" htmlFor="product-name" error={nameError} errorId="error-name">
            <input
              id="product-name"
              type="text"
              className="w-full px-4 py-2 border border-secondary rounded-xl text-sm bg-bg-secondary text-text-primary placeholder:text-secondary transition-colors duration-150 focus:outline-none focus:border-accent focus:shadow-glow"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ej: Camiseta Básica"
              aria-describedby={nameError ? 'error-name' : undefined}
              aria-invalid={!!nameError}
            />
          </FormField>

          <FormField label="Categoría" htmlFor="product-category" error={categoryError} errorId="error-category">
            <input
              id="product-category"
              type="text"
              className="w-full px-4 py-2 border border-secondary rounded-xl text-sm bg-bg-secondary text-text-primary placeholder:text-secondary transition-colors duration-150 focus:outline-none focus:border-accent focus:shadow-glow"
              value={form.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="Ej: Ropa, Accesorios"
              aria-describedby={categoryError ? 'error-category' : undefined}
              aria-invalid={!!categoryError}
            />
          </FormField>
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
                <FormField label="Talla" htmlFor={`variant-size-${index}`} error={sizeError} errorId={`error-variant-size-${index}`}>
                  <input
                    id={`variant-size-${index}`}
                    type="text"
                    className="w-full px-4 py-2 border border-secondary rounded-xl text-sm bg-bg-secondary text-text-primary placeholder:text-secondary transition-colors duration-150 focus:outline-none focus:border-accent focus:shadow-glow"
                    value={variant.size}
                    onChange={(e) => handleVariantChange(variant.key, 'size', e.target.value)}
                    placeholder="Ej: M, L, XL"
                    aria-describedby={sizeError ? `error-variant-size-${index}` : undefined}
                    aria-invalid={!!sizeError}
                  />
                </FormField>

                <FormField label="Color" htmlFor={`variant-color-${index}`} error={colorError} errorId={`error-variant-color-${index}`}>
                  <input
                    id={`variant-color-${index}`}
                    type="text"
                    className="w-full px-4 py-2 border border-secondary rounded-xl text-sm bg-bg-secondary text-text-primary placeholder:text-secondary transition-colors duration-150 focus:outline-none focus:border-accent focus:shadow-glow"
                    value={variant.color}
                    onChange={(e) => handleVariantChange(variant.key, 'color', e.target.value)}
                    placeholder="Ej: Rojo, Azul"
                    aria-describedby={colorError ? `error-variant-color-${index}` : undefined}
                    aria-invalid={!!colorError}
                  />
                </FormField>

                <FormField label="Stock" htmlFor={`variant-stock-${index}`} error={stockError} errorId={`error-variant-stock-${index}`}>
                  <input
                    id={`variant-stock-${index}`}
                    type="number"
                    className="w-full px-4 py-2 border border-secondary rounded-xl text-sm bg-bg-secondary text-text-primary placeholder:text-secondary transition-colors duration-150 focus:outline-none focus:border-accent focus:shadow-glow"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(variant.key, 'stock', e.target.value)}
                    min="0"
                    aria-describedby={stockError ? `error-variant-stock-${index}` : undefined}
                    aria-invalid={!!stockError}
                  />
                </FormField>

                <FormField label="Stock Mínimo" htmlFor={`variant-minStock-${index}`} error={minStockError} errorId={`error-variant-minStock-${index}`}>
                  <input
                    id={`variant-minStock-${index}`}
                    type="number"
                    className="w-full px-4 py-2 border border-secondary rounded-xl text-sm bg-bg-secondary text-text-primary placeholder:text-secondary transition-colors duration-150 focus:outline-none focus:border-accent focus:shadow-glow"
                    value={variant.minStock}
                    onChange={(e) => handleVariantChange(variant.key, 'minStock', e.target.value)}
                    min="0"
                    aria-describedby={minStockError ? `error-variant-minStock-${index}` : undefined}
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

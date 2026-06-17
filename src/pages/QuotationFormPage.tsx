import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { calculateSubtotal, calculateDocumentTotal } from '@/lib/calculateTotals';
import { validateQuotationForm } from '@/lib/formValidation';
import { Select } from '@/components/Select';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';
import type { ValidationError } from '@/lib/formValidation';
import './QuotationFormPage.css';

interface FormLine {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
}

function generateLineId(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function QuotationFormPage() {
  const { data, dispatch } = useData();
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  const [clientId, setClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<FormLine[]>([
    { id: generateLineId(), productId: '', variantId: '', quantity: 1, unitPrice: 0 },
  ]);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const clientOptions = useMemo(
    () => data.clients.map((c) => ({ value: c.id, label: c.name })),
    [data.clients]
  );

  const productOptions = useMemo(
    () => data.products.map((p) => ({ value: p.id, label: p.name })),
    [data.products]
  );

  function getVariantOptions(productId: string) {
    const product = data.products.find((p) => p.id === productId);
    if (!product) return [];
    return product.variants.map((v) => ({
      value: v.id,
      label: `${v.size} / ${v.color}`,
    }));
  }

  function updateLine(id: string, updates: Partial<FormLine>) {
    setLines((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, ...updates };
        // Reset variantId when product changes
        if (updates.productId && updates.productId !== line.productId) {
          updated.variantId = '';
        }
        return updated;
      })
    );
  }

  function addLine() {
    setLines((prev) => [
      ...prev,
      { id: generateLineId(), productId: '', variantId: '', quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((line) => line.id !== id));
  }

  const total = useMemo(() => calculateDocumentTotal(lines), [lines]);

  function handleSave() {
    const validationErrors = validateQuotationForm({ clientId, lines });
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);

    const productLines = lines.map((line) => ({
      id: line.id,
      productId: line.productId,
      variantId: line.variantId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      subtotal: calculateSubtotal(line.quantity, line.unitPrice),
    }));

    dispatch({
      type: 'QUOTATION_CREATE',
      payload: {
        clientId,
        sellerId: authState.user?.id ?? '',
        lines: productLines,
        total: calculateDocumentTotal(productLines),
        status: 'borrador',
        notes,
      },
    });

    navigate('/cotizaciones');
  }

  return (
    <div className="quotation-form">
      <h1 className="quotation-form__title">Nueva Cotización</h1>

      {errors.length > 0 && (
        <div className="quotation-form__errors" role="alert">
          {errors.map((err) => (
            <span key={err.field} className="quotation-form__error-item">
              {err.message}
            </span>
          ))}
        </div>
      )}

      <section className="quotation-form__section">
        <h2 className="quotation-form__section-title">Cliente</h2>
        <FormField label="Seleccionar cliente" htmlFor="client-select" error={errors.find((e) => e.field === 'clientId')?.message}>
          <Select
            id="client-select"
            options={clientOptions}
            value={clientId}
            onChange={setClientId}
            placeholder="Seleccionar cliente..."
          />
        </FormField>
      </section>

      <section className="quotation-form__section">
        <h2 className="quotation-form__section-title">Productos</h2>

        <div className="quotation-form__lines">
          {lines.map((line) => (
            <div key={line.id} className="quotation-form__line">
              <div className="quotation-form__line-field">
                <span className="quotation-form__line-label">Producto</span>
                <Select
                  options={productOptions}
                  value={line.productId}
                  onChange={(value) => updateLine(line.id, { productId: value })}
                  placeholder="Producto..."
                />
              </div>

              <div className="quotation-form__line-field">
                <span className="quotation-form__line-label">Variante</span>
                <Select
                  options={getVariantOptions(line.productId)}
                  value={line.variantId}
                  onChange={(value) => updateLine(line.id, { variantId: value })}
                  placeholder="Variante..."
                  disabled={!line.productId}
                />
              </div>

              <div className="quotation-form__line-field">
                <span className="quotation-form__line-label">Cantidad</span>
                <input
                  type="number"
                  className="quotation-form__line-input"
                  value={line.quantity}
                  onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) || 0 })}
                  min={1}
                />
              </div>

              <div className="quotation-form__line-field">
                <span className="quotation-form__line-label">Precio Unit.</span>
                <input
                  type="number"
                  className="quotation-form__line-input"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="quotation-form__line-field">
                <span className="quotation-form__line-label">Subtotal</span>
                <span className="quotation-form__line-subtotal">
                  ${calculateSubtotal(line.quantity, line.unitPrice).toLocaleString('es-CL')}
                </span>
              </div>

              <button
                type="button"
                className="quotation-form__line-remove"
                onClick={() => removeLine(line.id)}
                aria-label="Eliminar línea"
                disabled={lines.length === 1}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <button type="button" className="quotation-form__add-line" onClick={addLine}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar Línea
        </button>

        <div className="quotation-form__total">
          <span className="quotation-form__total-label">Total:</span>
          <span className="quotation-form__total-value">
            ${total.toLocaleString('es-CL')}
          </span>
        </div>
      </section>

      <section className="quotation-form__section">
        <h2 className="quotation-form__section-title">Notas</h2>
        <textarea
          className="quotation-form__notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales (opcional)..."
        />
      </section>

      <div className="quotation-form__actions">
        <Button variant="ghost" onClick={() => navigate('/cotizaciones')}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar Borrador
        </Button>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { calculateSubtotal, calculateDocumentTotal } from '@/lib/calculateTotals';
import { validateOrderForm } from '@/lib/formValidation';
import { validateStockAvailability } from '@/lib/stockValidation';
import { Select } from '@/components/Select';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';
import type { ValidationError } from '@/lib/formValidation';
import type { StockWarning } from '@/lib/stockValidation';
import './OrderFormPage.css';

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

export default function OrderFormPage() {
  const { data, dispatch } = useData();
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  const [clientId, setClientId] = useState('');
  const [dueDate, setDueDate] = useState('');
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

  const stockWarnings: StockWarning[] = useMemo(() => {
    const validLines = lines.filter((l) => l.productId && l.variantId && l.quantity > 0);
    if (validLines.length === 0) return [];
    return validateStockAvailability(data.products, validLines);
  }, [data.products, lines]);

  function getStockWarningForLine(variantId: string): StockWarning | undefined {
    return stockWarnings.find((w) => w.variantId === variantId);
  }

  function handleSave() {
    const validationErrors = validateOrderForm({ clientId, dueDate, lines });
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
      type: 'ORDER_CREATE',
      payload: {
        clientId,
        sellerId: authState.user?.id ?? '',
        lines: productLines,
        total: calculateDocumentTotal(productLines),
        status: 'activo',
        notes,
        dueDate,
      },
    });

    dispatch({
      type: 'STOCK_DEDUCT',
      payload: {
        items: productLines
          .filter((l) => l.variantId)
          .map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
      },
    });

    navigate('/pedidos');
  }

  return (
    <div className="order-form">
      <h1 className="order-form__title">Nuevo Pedido</h1>

      {errors.length > 0 && (
        <div className="order-form__errors" role="alert">
          {errors.map((err) => (
            <span key={err.field} className="order-form__error-item">
              {err.message}
            </span>
          ))}
        </div>
      )}

      <section className="order-form__section">
        <h2 className="order-form__section-title">Cliente</h2>
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

      <section className="order-form__section">
        <h2 className="order-form__section-title">Fecha de Entrega</h2>
        <FormField label="Fecha de entrega" htmlFor="due-date-input" error={errors.find((e) => e.field === 'dueDate')?.message}>
          <input
            id="due-date-input"
            type="date"
            className="order-form__date-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </FormField>
      </section>

      <section className="order-form__section">
        <h2 className="order-form__section-title">Productos</h2>

        <div className="order-form__lines">
          {lines.map((line) => {
            const warning = getStockWarningForLine(line.variantId);
            return (
              <div key={line.id} className="order-form__line">
                <div className="order-form__line-field">
                  <span className="order-form__line-label">Producto</span>
                  <Select
                    options={productOptions}
                    value={line.productId}
                    onChange={(value) => updateLine(line.id, { productId: value })}
                    placeholder="Producto..."
                  />
                </div>

                <div className="order-form__line-field">
                  <span className="order-form__line-label">Variante</span>
                  <Select
                    options={getVariantOptions(line.productId)}
                    value={line.variantId}
                    onChange={(value) => updateLine(line.id, { variantId: value })}
                    placeholder="Variante..."
                    disabled={!line.productId}
                  />
                </div>

                <div className="order-form__line-field">
                  <span className="order-form__line-label">Cantidad</span>
                  <input
                    type="number"
                    className="order-form__line-input"
                    value={line.quantity}
                    onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) || 0 })}
                    min={1}
                  />
                </div>

                <div className="order-form__line-field">
                  <span className="order-form__line-label">Precio Unit.</span>
                  <input
                    type="number"
                    className="order-form__line-input"
                    value={line.unitPrice}
                    onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) || 0 })}
                    min={0}
                  />
                </div>

                <div className="order-form__line-field">
                  <span className="order-form__line-label">Subtotal</span>
                  <span className="order-form__line-subtotal">
                    ${calculateSubtotal(line.quantity, line.unitPrice).toLocaleString('es-CL')}
                  </span>
                </div>

                <button
                  type="button"
                  className="order-form__line-remove"
                  onClick={() => removeLine(line.id)}
                  aria-label="Eliminar línea"
                  disabled={lines.length === 1}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>

                {warning && (
                  <div className="order-form__line-warning" role="alert">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Stock insuficiente: disponible {warning.available}, solicitado {warning.requested}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button type="button" className="order-form__add-line" onClick={addLine}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar Línea
        </button>

        <div className="order-form__total">
          <span className="order-form__total-label">Total:</span>
          <span className="order-form__total-value">
            ${total.toLocaleString('es-CL')}
          </span>
        </div>
      </section>

      <section className="order-form__section">
        <h2 className="order-form__section-title">Notas</h2>
        <textarea
          className="order-form__notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales (opcional)..."
        />
      </section>

      <div className="order-form__actions">
        <Button variant="ghost" onClick={() => navigate('/pedidos')}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Confirmar Pedido
        </Button>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/lib/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { calculateSubtotal, calculateDocumentTotal } from '@/lib/calculateTotals';
import { validateQuotationForm } from '@/lib/formValidation';
import { Select } from '@/components/Select';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/Button';
import { InlineClientForm } from '@/components/InlineClientForm';
import type { Client } from '@/types/models';
import type { ValidationError } from '@/lib/formValidation';

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
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [showInlineClientForm, setShowInlineClientForm] = useState(false);
  const [lines, setLines] = useState<FormLine[]>([
    { id: generateLineId(), productId: '', variantId: '', quantity: 1, unitPrice: 0 },
  ]);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [pendingAutoSelect, setPendingAutoSelect] = useState(false);

  const clientOptions = useMemo(
    () => data.clients.map((c) => ({ value: c.id, label: c.name })),
    [data.clients]
  );

  const productOptions = useMemo(
    () => data.products.map((p) => ({ value: p.id, label: p.name })),
    [data.products]
  );

  // Auto-select the latest client when the inline form creates one
  useEffect(() => {
    if (pendingAutoSelect && data.clients.length > 0) {
      const latestClient = data.clients[data.clients.length - 1];
      if (latestClient) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setClientId(latestClient.id);
      }
      setPendingAutoSelect(false);
    }
  }, [pendingAutoSelect, data.clients]);

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

  function handleInlineClientSave(clientData: Omit<Client, 'id'>) {
    setPendingAutoSelect(true);
    dispatch({ type: 'CLIENT_CREATE', payload: clientData });
    setShowInlineClientForm(false);
  }

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
        estimatedDeliveryDate: estimatedDeliveryDate || undefined,
      },
    });

    navigate('/cotizaciones');
  }

  return (
    <div className="p-6 md:p-8 max-w-[960px]">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Nueva Cotización</h1>

      {errors.length > 0 && (
        <div className="flex flex-col gap-1 mb-4 p-4 bg-destructive-muted border border-destructive/20 rounded-xl" role="alert">
          {errors.map((err) => (
            <span key={err.field} className="text-sm text-destructive">
              {err.message}
            </span>
          ))}
        </div>
      )}

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-secondary/50">Cliente</h2>
        <FormField label="Seleccionar cliente" htmlFor="client-select" error={errors.find((e) => e.field === 'clientId')?.message}>
          <Select
            id="client-select"
            options={clientOptions}
            value={clientId}
            onChange={setClientId}
            placeholder="Seleccionar cliente..."
          />
        </FormField>
        {!showInlineClientForm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInlineClientForm(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Crear nuevo cliente
          </Button>
        )}
        {showInlineClientForm && (
          <InlineClientForm
            onSave={handleInlineClientSave}
            onCancel={() => setShowInlineClientForm(false)}
          />
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-secondary/50">Productos</h2>

        <div className="flex flex-col gap-4">
          {lines.map((line) => (
            <div key={line.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_100px_120px_auto] gap-3 items-end p-4 bg-surface border border-secondary/50 rounded-xl">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Producto</span>
                <Select
                  options={productOptions}
                  value={line.productId}
                  onChange={(value) => updateLine(line.id, { productId: value })}
                  placeholder="Producto..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Variante</span>
                <Select
                  options={getVariantOptions(line.productId)}
                  value={line.variantId}
                  onChange={(value) => updateLine(line.id, { variantId: value })}
                  placeholder="Variante..."
                  disabled={!line.productId}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Cantidad</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-bg-secondary border border-secondary rounded-xl font-mono text-sm text-text-primary focus:border-accent focus:shadow-glow focus:outline-none transition-all duration-150"
                  value={line.quantity}
                  onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) || 0 })}
                  min={1}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Precio Unit.</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-bg-secondary border border-secondary rounded-xl font-mono text-sm text-text-primary focus:border-accent focus:shadow-glow focus:outline-none transition-all duration-150"
                  value={line.unitPrice}
                  onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) || 0 })}
                  min={0}
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Subtotal</span>
                <span className="font-mono text-sm text-text-muted py-2 text-right whitespace-nowrap">
                  ${calculateSubtotal(line.quantity, line.unitPrice).toLocaleString('es-CL')}
                </span>
              </div>

              <button
                type="button"
                className="flex items-center justify-center w-9 h-9 rounded-xl text-destructive hover:bg-destructive-muted transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none"
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

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 mt-4 text-accent font-medium text-sm rounded-xl hover:bg-accent/10 transition-colors duration-150"
          onClick={addLine}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar Línea
        </button>

        <div className="flex justify-end items-center gap-4 py-4 border-t-2 border-secondary mt-4">
          <span className="text-base font-semibold text-text-primary">Total:</span>
          <span className="font-mono text-xl font-bold text-text-primary">
            ${total.toLocaleString('es-CL')}
          </span>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-secondary/50">Fecha de entrega estimada</h2>
        <FormField label="Fecha de envío/entrega estimada (opcional)" htmlFor="estimated-delivery-date">
          <input
            id="estimated-delivery-date"
            type="date"
            className="w-full px-3 py-2 bg-bg-secondary border border-secondary rounded-xl font-mono text-sm text-text-primary focus:border-accent focus:shadow-glow focus:outline-none transition-all duration-150"
            value={estimatedDeliveryDate}
            onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
          />
        </FormField>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4 pb-2 border-b border-secondary/50">Notas</h2>
        <textarea
          className="w-full min-h-[80px] p-4 bg-bg-secondary border border-secondary rounded-xl text-sm text-text-primary placeholder:text-secondary resize-y focus:border-accent focus:shadow-glow focus:outline-none transition-all duration-150"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas adicionales (opcional)..."
        />
      </section>

      <div className="flex justify-end gap-4 pt-6 border-t border-secondary/50 flex-col sm:flex-row">
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

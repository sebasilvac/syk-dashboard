import { useState } from 'react';
import type { Order, Deposit } from '@/types/models';
import { calculatePendingBalance } from '@/lib/depositValidation';
import { DepositForm } from '@/components/DepositForm';
import { Button } from '@/components/Button';

interface DepositSectionProps {
  order: Order;
  onAdd: (deposit: Omit<Deposit, 'id'>) => void;
  onRemove: (depositId: string) => void;
  isDelivered: boolean;
}

export function DepositSection({ order, onAdd, onRemove, isDelivered }: DepositSectionProps) {
  const [showForm, setShowForm] = useState(false);

  const deposits = order.deposits;
  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  const pendingBalance = calculatePendingBalance(order.total, deposits);

  function handleSaveDeposit(data: Omit<Deposit, 'id'>) {
    onAdd(data);
    setShowForm(false);
  }

  function formatCurrency(value: number): string {
    return `${value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatMethod(method: string): string {
    return method === 'transferencia' ? 'Transferencia' : 'Efectivo';
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-text-primary m-0">Depósitos / Pagos</h3>
        {!showForm && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar Depósito
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-6 px-6 py-4 bg-bg-secondary rounded-xl max-md:flex-col max-md:items-start max-md:gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Total acumulado</span>
          <span className="font-mono text-base font-semibold text-text-primary">{formatCurrency(totalDeposited)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">Saldo pendiente</span>
          <span className="font-mono text-base font-semibold text-warning">
            {formatCurrency(pendingBalance)}
          </span>
        </div>
      </div>

      {/* Table */}
      {deposits.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-xs font-semibold uppercase tracking-wider text-text-muted text-left px-4 py-2 border-b border-secondary/50">Monto</th>
              <th className="text-xs font-semibold uppercase tracking-wider text-text-muted text-left px-4 py-2 border-b border-secondary/50">Método</th>
              <th className="text-xs font-semibold uppercase tracking-wider text-text-muted text-left px-4 py-2 border-b border-secondary/50">Fecha</th>
              <th className="text-xs font-semibold uppercase tracking-wider text-text-muted text-left px-4 py-2 border-b border-secondary/50">Acción</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit) => (
              <tr key={deposit.id}>
                <td className="text-sm text-text-primary px-4 py-2 border-b border-secondary/50 font-mono" data-tabular>{formatCurrency(deposit.amount)}</td>
                <td className="text-sm text-text-primary px-4 py-2 border-b border-secondary/50">{formatMethod(deposit.method)}</td>
                <td className="text-sm text-text-primary px-4 py-2 border-b border-secondary/50">{formatDate(deposit.date)}</td>
                <td className="text-sm text-text-primary px-4 py-2 border-b border-secondary/50">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center w-7 h-7 rounded-xl text-text-muted cursor-pointer transition-all duration-150 hover:bg-destructive-muted hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={() => onRemove(deposit.id)}
                    disabled={isDelivered}
                    aria-label={`Eliminar depósito de ${formatCurrency(deposit.amount)}`}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="px-6 py-4 text-center text-sm text-text-muted">No hay depósitos registrados</p>
      )}

      {/* Form */}
      {showForm && (
        <DepositForm
          pendingBalance={pendingBalance}
          onSave={handleSaveDeposit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </section>
  );
}

export type { DepositSectionProps };

import { useState } from 'react';
import type { Deposit } from '@/types/models';
import type { ValidationError } from '@/lib/formValidation';
import { validateDepositForm, checkDepositExcess } from '@/lib/depositValidation';
import { FormField } from '@/design-system/components/FormField';
import { Select } from '@/design-system/components/Select';
import { Button } from '@/design-system/components/Button';
import { inputVariants } from '@/design-system/variants/input';
import { cn } from '@/design-system/utils/cn';

interface DepositFormProps {
  pendingBalance: number;
  onSave: (data: Omit<Deposit, 'id'>) => void;
  onCancel: () => void;
}

const PAYMENT_METHOD_OPTIONS = [
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'efectivo', label: 'Efectivo' },
];

export function DepositForm({ pendingBalance, onSave, onCancel }: DepositFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [method, setMethod] = useState<string>('transferencia');
  const [date, setDate] = useState<string>('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [showExcessWarning, setShowExcessWarning] = useState(false);

  function getFieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  function handleAmountChange(value: string) {
    setAmount(value);
    const numericAmount = parseFloat(value) || 0;
    setShowExcessWarning(numericAmount > 0 && checkDepositExcess(numericAmount, pendingBalance));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const numericAmount = parseFloat(amount) || 0;
    const validationErrors = validateDepositForm({ amount: numericAmount, date });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    onSave({
      amount: numericAmount,
      method: method as Deposit['method'],
      date,
    });
  }

  const amountError = getFieldError('amount');
  const dateError = getFieldError('date');

  return (
    <form className="flex flex-col gap-4 p-6 bg-bg-secondary border border-secondary/50 rounded-xl" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Monto" error={amountError} htmlFor="deposit-amount">
          <input
            id="deposit-amount"
            type="number"
            className={cn(inputVariants({ state: amountError ? 'error' : 'default' }))}
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </FormField>

        <FormField label="Método de pago" htmlFor="deposit-method">
          <Select
            id="deposit-method"
            options={PAYMENT_METHOD_OPTIONS}
            value={method}
            onChange={setMethod}
          />
        </FormField>

        <FormField label="Fecha" error={dateError} htmlFor="deposit-date">
          <input
            id="deposit-date"
            type="date"
            className={cn(inputVariants({ state: dateError ? 'error' : 'default' }))}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormField>
      </div>

      {showExcessWarning && (
        <div className="flex items-center gap-2 px-4 py-2 bg-warning-muted border border-warning rounded-xl text-[0.8125rem] font-medium text-warning" role="alert">
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
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>El monto supera el saldo pendiente</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} type="button" size="sm">
          Cancelar
        </Button>
        <Button variant="primary" type="submit" size="sm">
          Registrar depósito
        </Button>
      </div>
    </form>
  );
}

export type { DepositFormProps };

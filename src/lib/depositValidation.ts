import type { Deposit } from '@/types/models';
import type { ValidationError } from '@/lib/formValidation';

export interface DepositFormData {
  amount: number;
  date: string;
}

export function validateDepositForm(data: DepositFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.amount <= 0) {
    errors.push({ field: 'amount', message: 'El monto es requerido' });
  }

  if (!data.date || data.date.trim() === '') {
    errors.push({ field: 'date', message: 'La fecha es requerida' });
  }

  return errors;
}

export function checkDepositExcess(amount: number, pendingBalance: number): boolean {
  return amount > pendingBalance;
}

export function calculatePendingBalance(orderTotal: number, deposits: Deposit[]): number {
  const totalDeposited = deposits.reduce((sum, d) => sum + d.amount, 0);
  return orderTotal - totalDeposited;
}

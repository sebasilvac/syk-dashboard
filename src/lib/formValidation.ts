export interface ValidationError {
  field: string;
  message: string;
}

export interface QuotationFormData {
  clientId: string;
  lines: Array<{ productId: string; variantId: string; quantity: number; unitPrice: number }>;
}

export interface OrderFormData {
  clientId: string;
  dueDate: string;
  lines: Array<{ productId: string; variantId: string; quantity: number; unitPrice: number }>;
}

export function validateQuotationForm(data: QuotationFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.clientId || data.clientId.trim() === '') {
    errors.push({ field: 'clientId', message: 'Seleccione un cliente' });
  }

  if (!data.lines || data.lines.length === 0) {
    errors.push({ field: 'lines', message: 'Agrega al menos un producto' });
  }

  return errors;
}

export function validateOrderForm(data: OrderFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.clientId || data.clientId.trim() === '') {
    errors.push({ field: 'clientId', message: 'Seleccione un cliente' });
  }

  if (!data.dueDate || data.dueDate.trim() === '') {
    errors.push({ field: 'dueDate', message: 'Seleccione una fecha de entrega' });
  }

  if (!data.lines || data.lines.length === 0) {
    errors.push({ field: 'lines', message: 'Agrega al menos un producto' });
  }

  return errors;
}

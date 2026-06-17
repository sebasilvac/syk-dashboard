import type { ValidationError } from '@/lib/formValidation';

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
}

export function validateClientForm(data: ClientFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'El nombre es requerido' });
  }

  return errors;
}

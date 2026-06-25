import type { ValidationError } from '@/lib/formValidation';

export interface VariantFormData {
  size: string;
  color: string;
  stock: number;
  minStock: number;
}

export interface ProductFormData {
  name: string;
  category: string;
  variants: VariantFormData[];
}

export function validateProductForm(data: ProductFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push({ field: 'name', message: 'El nombre del producto es requerido' });
  }

  if (!data.category || data.category.trim() === '') {
    errors.push({ field: 'category', message: 'La categoría es requerida' });
  }

  if (!data.variants || data.variants.length === 0) {
    errors.push({ field: 'variants', message: 'Agrega al menos una variante' });
  } else {
    data.variants.forEach((variant, index) => {
      if (!variant.size || variant.size.trim() === '') {
        errors.push({ field: `variants[${index}].size`, message: 'La talla es requerida' });
      }

      if (!variant.color || variant.color.trim() === '') {
        errors.push({ field: `variants[${index}].color`, message: 'El color es requerido' });
      }

      if (variant.stock < 0) {
        errors.push({ field: `variants[${index}].stock`, message: 'El stock no puede ser negativo' });
      }

      if (variant.minStock < 0) {
        errors.push({ field: `variants[${index}].minStock`, message: 'El stock mínimo no puede ser negativo' });
      }
    });
  }

  return errors;
}

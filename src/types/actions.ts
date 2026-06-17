import type { Order, Quotation, Variant } from './models';

export type DataAction =
  | { type: 'QUOTATION_CREATE'; payload: Omit<Quotation, 'id' | 'number' | 'createdAt' | 'updatedAt'> }
  | { type: 'QUOTATION_UPDATE'; payload: { id: string; changes: Partial<Quotation> } }
  | { type: 'QUOTATION_APPROVE'; payload: { id: string } }
  | { type: 'QUOTATION_REJECT'; payload: { id: string } }
  | { type: 'ORDER_CREATE'; payload: Omit<Order, 'id' | 'number' | 'createdAt' | 'updatedAt'> }
  | { type: 'ORDER_CREATE_FROM_QUOTATION'; payload: { quotationId: string; dueDate: string } }
  | { type: 'ORDER_MARK_DELIVERED'; payload: { id: string } }
  | { type: 'VARIANT_ADD'; payload: { productId: string; variant: Omit<Variant, 'id'> } }
  | { type: 'VARIANT_UPDATE_STOCK'; payload: { productId: string; variantId: string; stock: number } }
  | { type: 'STOCK_DEDUCT'; payload: { items: Array<{ variantId: string; quantity: number }> } };

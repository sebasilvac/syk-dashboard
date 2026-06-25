import type { Client, Deposit, Order, Quotation, Variant } from './models';

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
  | { type: 'STOCK_DEDUCT'; payload: { items: Array<{ variantId: string; quantity: number }> } }
  | { type: 'CLIENT_CREATE'; payload: Omit<Client, 'id'> }
  | { type: 'CLIENT_UPDATE'; payload: { id: string; changes: Partial<Omit<Client, 'id'>> } }
  | { type: 'CLIENT_DELETE'; payload: { id: string } }
  | { type: 'DEPOSIT_ADD'; payload: { orderId: string; deposit: Omit<Deposit, 'id'> } }
  | { type: 'DEPOSIT_REMOVE'; payload: { orderId: string; depositId: string } }
  | { type: 'PRODUCT_CREATE'; payload: { name: string; category: string; variants: Omit<Variant, 'id'>[] } }
  | { type: 'PRODUCT_DELETE'; payload: { id: string } }
  | { type: 'VARIANT_DELETE'; payload: { productId: string; variantId: string } };

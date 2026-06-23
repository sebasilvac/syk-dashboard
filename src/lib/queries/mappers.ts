import type { Client, Variant, Product, ProductLine, Deposit } from '@/types/models';
import type { Database } from '@/types/database';

export type ClientRow = Database['public']['Tables']['clients']['Row'];
export type ProductRow = Database['public']['Tables']['products']['Row'];
export type VariantRow = Database['public']['Tables']['variants']['Row'];
export type QuotationLineRow = Database['public']['Tables']['quotation_lines']['Row'];
export type OrderLineRow = Database['public']['Tables']['order_lines']['Row'];
export type DepositRow = Database['public']['Tables']['deposits']['Row'];

export function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
  };
}

export function mapVariant(row: VariantRow): Variant {
  return {
    id: row.id,
    size: row.size,
    color: row.color,
    stock: row.stock,
    minStock: row.min_stock,
  };
}

export function mapProduct(row: ProductRow & { variants: VariantRow[] }): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    variants: (row.variants ?? []).map(mapVariant),
  };
}

export function mapQuotationLine(row: QuotationLineRow): ProductLine {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    subtotal: row.subtotal,
  };
}

export function mapOrderLine(row: OrderLineRow): ProductLine {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    subtotal: row.subtotal,
  };
}

export function mapDeposit(row: DepositRow): Deposit {
  return {
    id: row.id,
    amount: row.amount,
    method: row.method as Deposit['method'],
    date: row.date,
  };
}

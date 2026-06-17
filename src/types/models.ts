// === Roles y Autenticación ===
export type Role = 'admin' | 'vendedor';

export interface User {
  id: string;
  name: string;
  role: Role;
}

// === Clientes ===
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// === Inventario ===
export interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
  minStock: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  variants: Variant[];
}

// === Cotizaciones ===
export type QuotationStatus = 'borrador' | 'pendiente' | 'aprobada' | 'rechazada';

export interface ProductLine {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Quotation {
  id: string;
  number: string;
  clientId: string;
  sellerId: string;
  lines: ProductLine[];
  total: number;
  status: QuotationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// === Pedidos ===
export type OrderStatus = 'activo' | 'entregado';

export interface Order {
  id: string;
  number: string;
  clientId: string;
  sellerId: string;
  lines: ProductLine[];
  total: number;
  status: OrderStatus;
  notes: string;
  dueDate: string;
  quotationId?: string;
  createdAt: string;
  updatedAt: string;
}

// === Alertas ===
export type AlertSeverity = 'warning' | 'critical';
export type AlertType = 'due_soon' | 'overdue' | 'low_stock';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  resourceType: 'order' | 'product';
  resourceId: string;
}

// === Estado Global ===
export interface AppData {
  clients: Client[];
  products: Product[];
  quotations: Quotation[];
  orders: Order[];
}

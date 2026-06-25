import type { AppData, Client, Deposit, Order, Product, Quotation, User } from '@/types/models';

// === Helper para fechas relativas ===
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function daysAgo(days: number): string {
  return daysFromNow(-days);
}

// === Usuarios mock para login simulado ===
export const mockUsers: User[] = [
  { id: 'user-1', name: 'Carolina Méndez', role: 'admin' },
  { id: 'user-2', name: 'Luis Herrera', role: 'vendedor' },
];

// === Clientes ===
const clients: Client[] = [
  {
    id: 'client-1',
    name: 'Boutique La Moderna',
    email: 'compras@lamoderna.cl',
    phone: '+56 9 8765 4321',
  },
  {
    id: 'client-2',
    name: 'Tienda Estilo Urbano',
    email: 'pedidos@estilourbano.cl',
    phone: '+56 9 1234 5678',
  },
  {
    id: 'client-3',
    name: 'Distribuidora Moda Sur',
    email: 'contacto@modasur.cl',
    phone: '+56 9 5555 3333',
  },
];

// === Productos con variantes ===
const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Polera Básica Algodón',
    category: 'Poleras',
    variants: [
      { id: 'var-1a', size: 'S', color: 'Blanco', stock: 25, minStock: 10 },
      { id: 'var-1b', size: 'M', color: 'Blanco', stock: 30, minStock: 10 },
      { id: 'var-1c', size: 'L', color: 'Negro', stock: 8, minStock: 10 }, // stock bajo
      { id: 'var-1d', size: 'XL', color: 'Negro', stock: 15, minStock: 10 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Jeans Slim Fit',
    category: 'Pantalones',
    variants: [
      { id: 'var-2a', size: '28', color: 'Azul Oscuro', stock: 12, minStock: 5 },
      { id: 'var-2b', size: '30', color: 'Azul Oscuro', stock: 18, minStock: 5 },
      { id: 'var-2c', size: '32', color: 'Negro', stock: 10, minStock: 5 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Chaqueta Denim Oversize',
    category: 'Chaquetas',
    variants: [
      { id: 'var-3a', size: 'M', color: 'Azul Claro', stock: 6, minStock: 4 },
      { id: 'var-3b', size: 'L', color: 'Azul Claro', stock: 9, minStock: 4 },
      { id: 'var-3c', size: 'L', color: 'Negro', stock: 3, minStock: 4 }, // stock bajo
    ],
  },
  {
    id: 'prod-4',
    name: 'Vestido Midi Floral',
    category: 'Vestidos',
    variants: [
      { id: 'var-4a', size: 'S', color: 'Rosa', stock: 14, minStock: 5 },
      { id: 'var-4b', size: 'M', color: 'Rosa', stock: 20, minStock: 5 },
      { id: 'var-4c', size: 'M', color: 'Celeste', stock: 11, minStock: 5 },
      { id: 'var-4d', size: 'L', color: 'Celeste', stock: 7, minStock: 5 },
    ],
  },
  {
    id: 'prod-5',
    name: 'Falda Plisada',
    category: 'Faldas',
    variants: [
      { id: 'var-5a', size: 'S', color: 'Negro', stock: 16, minStock: 8 },
      { id: 'var-5b', size: 'M', color: 'Negro', stock: 22, minStock: 8 },
      { id: 'var-5c', size: 'M', color: 'Beige', stock: 5, minStock: 8 }, // stock bajo
    ],
  },
];

// === Cotizaciones en distintos estados ===
const quotations: Quotation[] = [
  {
    id: 'quot-1',
    number: 'COT-001',
    clientId: 'client-1',
    sellerId: 'user-2',
    lines: [
      { id: 'line-q1a', productId: 'prod-1', variantId: 'var-1a', quantity: 10, unitPrice: 8500, subtotal: 85000 },
      { id: 'line-q1b', productId: 'prod-1', variantId: 'var-1b', quantity: 15, unitPrice: 8500, subtotal: 127500 },
    ],
    total: 212500,
    status: 'pendiente',
    notes: 'Entrega solicitada para fin de mes.',
    estimatedDeliveryDate: daysFromNow(14),
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'quot-2',
    number: 'COT-002',
    clientId: 'client-2',
    sellerId: 'user-2',
    lines: [
      { id: 'line-q2a', productId: 'prod-2', variantId: 'var-2a', quantity: 8, unitPrice: 25000, subtotal: 200000 },
      { id: 'line-q2b', productId: 'prod-3', variantId: 'var-3a', quantity: 4, unitPrice: 35000, subtotal: 140000 },
    ],
    total: 340000,
    status: 'aprobada',
    notes: 'Cliente prefiere envío a domicilio.',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(3),
  },
  {
    id: 'quot-3',
    number: 'COT-003',
    clientId: 'client-3',
    sellerId: 'user-1',
    lines: [
      { id: 'line-q3a', productId: 'prod-4', variantId: 'var-4b', quantity: 12, unitPrice: 18000, subtotal: 216000 },
    ],
    total: 216000,
    status: 'pendiente',
    notes: '',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'quot-4',
    number: 'COT-004',
    clientId: 'client-1',
    sellerId: 'user-1',
    lines: [
      { id: 'line-q4a', productId: 'prod-5', variantId: 'var-5a', quantity: 6, unitPrice: 15000, subtotal: 90000 },
      { id: 'line-q4b', productId: 'prod-5', variantId: 'var-5b', quantity: 6, unitPrice: 15000, subtotal: 90000 },
    ],
    total: 180000,
    status: 'rechazada',
    notes: 'Cliente solicitó descuento que no fue aprobado.',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(12),
  },
];

// === Pedidos en distintos estados ===
const orders: Order[] = [
  {
    id: 'order-1',
    number: 'PED-001',
    clientId: 'client-2',
    sellerId: 'user-2',
    lines: [
      { id: 'line-o1a', productId: 'prod-2', variantId: 'var-2b', quantity: 10, unitPrice: 25000, subtotal: 250000 },
    ],
    total: 250000,
    status: 'activo',
    notes: 'Pedido urgente.',
    dueDate: daysFromNow(1), // Due within 2 days → triggers "due_soon" alert
    quotationId: undefined,
    deposits: [],
    createdAt: daysAgo(7),
    updatedAt: daysAgo(7),
  },
  {
    id: 'order-2',
    number: 'PED-002',
    clientId: 'client-1',
    sellerId: 'user-2',
    lines: [
      { id: 'line-o2a', productId: 'prod-4', variantId: 'var-4a', quantity: 5, unitPrice: 18000, subtotal: 90000 },
      { id: 'line-o2b', productId: 'prod-4', variantId: 'var-4c', quantity: 5, unitPrice: 18000, subtotal: 90000 },
    ],
    total: 180000,
    status: 'activo',
    notes: 'Fecha de entrega ya pasada — requiere atención.',
    dueDate: daysAgo(3), // Overdue → triggers "overdue" alert
    quotationId: undefined,
    deposits: [
      { id: 'dep-1', amount: 50000, method: 'transferencia', date: daysAgo(10) },
    ] satisfies Deposit[],
    createdAt: daysAgo(14),
    updatedAt: daysAgo(14),
  },
  {
    id: 'order-3',
    number: 'PED-003',
    clientId: 'client-3',
    sellerId: 'user-1',
    lines: [
      { id: 'line-o3a', productId: 'prod-3', variantId: 'var-3b', quantity: 3, unitPrice: 35000, subtotal: 105000 },
      { id: 'line-o3b', productId: 'prod-1', variantId: 'var-1d', quantity: 8, unitPrice: 8500, subtotal: 68000 },
    ],
    total: 173000,
    status: 'entregado',
    notes: 'Entregado sin observaciones.',
    dueDate: daysAgo(1),
    quotationId: 'quot-2',
    deposits: [
      { id: 'dep-2', amount: 100000, method: 'transferencia', date: daysAgo(18) },
      { id: 'dep-3', amount: 73000, method: 'efectivo', date: daysAgo(5) },
    ] satisfies Deposit[],
    createdAt: daysAgo(20),
    updatedAt: daysAgo(1),
  },
];

// === Estado inicial de la aplicación ===
export const initialData: AppData = {
  clients,
  products,
  quotations,
  orders,
};

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { AppData, User, Quotation, Order, Client, Product } from '@/types/models';

/**
 * Feature: syk-dashboard-ui, Property 12: Alcance de datos según rol
 *
 * Para cualquier conjunto de datos con múltiples vendedores:
 * - Si el usuario es vendedor, las métricas y listados SHALL mostrar solo items donde sellerId === currentUser.id
 * - Si el usuario es admin, las métricas y listados SHALL incluir todos los items sin filtro de vendedor
 *
 * **Validates: Requirements 3.4, 3.5**
 */

// Pure filtering logic extracted from useDataScope hook
function filterDataByRole(data: AppData, user: User | null): AppData {
  if (!user || user.role === 'admin') {
    return data;
  }
  // vendedor: filter by sellerId
  return {
    ...data,
    quotations: data.quotations.filter(q => q.sellerId === user.id),
    orders: data.orders.filter(o => o.sellerId === user.id),
  };
}

// --- Generators ---

const arbSellerId = fc.constantFrom('seller-1', 'seller-2', 'seller-3', 'seller-4');

const arbClient: fc.Arbitrary<Client> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  email: fc.emailAddress(),
  phone: fc.string({ minLength: 5, maxLength: 15 }),
});

const arbProduct: fc.Arbitrary<Product> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  category: fc.constantFrom('Camisas', 'Pantalones', 'Zapatos'),
  variants: fc.array(
    fc.record({
      id: fc.uuid(),
      size: fc.constantFrom('S', 'M', 'L', 'XL'),
      color: fc.constantFrom('Rojo', 'Azul', 'Negro'),
      stock: fc.integer({ min: 0, max: 500 }),
      minStock: fc.integer({ min: 1, max: 50 }),
    }),
    { minLength: 1, maxLength: 3 }
  ),
});

const arbQuotation: fc.Arbitrary<Quotation> = fc.record({
  id: fc.uuid(),
  number: fc.string({ minLength: 3, maxLength: 10 }),
  clientId: fc.uuid(),
  sellerId: arbSellerId,
  lines: fc.constant([]),
  total: fc.integer({ min: 0, max: 100000 }),
  status: fc.constantFrom('pendiente', 'aprobada', 'rechazada'),
  notes: fc.string({ maxLength: 50 }),
  createdAt: fc.constant('2024-01-01T00:00:00Z'),
  updatedAt: fc.constant('2024-01-01T00:00:00Z'),
});

const arbOrder: fc.Arbitrary<Order> = fc.record({
  id: fc.uuid(),
  number: fc.string({ minLength: 3, maxLength: 10 }),
  clientId: fc.uuid(),
  sellerId: arbSellerId,
  lines: fc.constant([]),
  total: fc.integer({ min: 0, max: 100000 }),
  status: fc.constantFrom('activo', 'entregado'),
  notes: fc.string({ maxLength: 50 }),
  dueDate: fc.constant('2024-06-01'),
  quotationId: fc.option(fc.uuid(), { nil: undefined }),
  deposits: fc.constant([]),
  createdAt: fc.constant('2024-01-01T00:00:00Z'),
  updatedAt: fc.constant('2024-01-01T00:00:00Z'),
});

const arbAppData: fc.Arbitrary<AppData> = fc.record({
  clients: fc.array(arbClient, { minLength: 1, maxLength: 5 }),
  products: fc.array(arbProduct, { minLength: 1, maxLength: 5 }),
  quotations: fc.array(arbQuotation, { minLength: 2, maxLength: 15 }),
  orders: fc.array(arbOrder, { minLength: 2, maxLength: 15 }),
});

const arbAdminUser: fc.Arbitrary<User> = fc.record({
  id: arbSellerId,
  name: fc.string({ minLength: 1, maxLength: 20 }),
  role: fc.constant('admin' as const),
});

const arbVendedorUser: fc.Arbitrary<User> = fc.record({
  id: arbSellerId,
  name: fc.string({ minLength: 1, maxLength: 20 }),
  role: fc.constant('vendedor' as const),
});

// --- Tests ---

describe('Feature: syk-dashboard-ui, Property 12: Alcance de datos según rol', () => {
  it('admin recibe todos los datos sin filtro — quotations y orders iguales al input', () => {
    fc.assert(
      fc.property(arbAppData, arbAdminUser, (data, adminUser) => {
        const result = filterDataByRole(data, adminUser);

        // Admin gets all quotations and orders unchanged
        expect(result.quotations).toEqual(data.quotations);
        expect(result.orders).toEqual(data.orders);
        expect(result.quotations.length).toBe(data.quotations.length);
        expect(result.orders.length).toBe(data.orders.length);
      }),
      { numRuns: 100 }
    );
  });

  it('vendedor solo recibe quotations donde sellerId === user.id', () => {
    fc.assert(
      fc.property(arbAppData, arbVendedorUser, (data, vendedorUser) => {
        const result = filterDataByRole(data, vendedorUser);

        // Every returned quotation belongs to the vendedor
        for (const q of result.quotations) {
          expect(q.sellerId).toBe(vendedorUser.id);
        }

        // Count matches expected
        const expected = data.quotations.filter(q => q.sellerId === vendedorUser.id);
        expect(result.quotations.length).toBe(expected.length);
      }),
      { numRuns: 100 }
    );
  });

  it('vendedor solo recibe orders donde sellerId === user.id', () => {
    fc.assert(
      fc.property(arbAppData, arbVendedorUser, (data, vendedorUser) => {
        const result = filterDataByRole(data, vendedorUser);

        // Every returned order belongs to the vendedor
        for (const o of result.orders) {
          expect(o.sellerId).toBe(vendedorUser.id);
        }

        // Count matches expected
        const expected = data.orders.filter(o => o.sellerId === vendedorUser.id);
        expect(result.orders.length).toBe(expected.length);
      }),
      { numRuns: 100 }
    );
  });

  it('products y clients nunca se filtran — ambos roles reciben todos', () => {
    fc.assert(
      fc.property(
        arbAppData,
        fc.oneof(arbAdminUser, arbVendedorUser),
        (data, user) => {
          const result = filterDataByRole(data, user);

          // Products and clients are always returned unchanged
          expect(result.clients).toEqual(data.clients);
          expect(result.products).toEqual(data.products);
          expect(result.clients.length).toBe(data.clients.length);
          expect(result.products.length).toBe(data.products.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('null user (sin sesión) recibe todos los datos como admin', () => {
    fc.assert(
      fc.property(arbAppData, (data) => {
        const result = filterDataByRole(data, null);

        expect(result.quotations).toEqual(data.quotations);
        expect(result.orders).toEqual(data.orders);
        expect(result.clients).toEqual(data.clients);
        expect(result.products).toEqual(data.products);
      }),
      { numRuns: 100 }
    );
  });
});

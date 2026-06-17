import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeAlerts, diffDays } from '@/lib/computeAlerts';
import type { AppData, Order, Product, Variant } from '@/types/models';

/**
 * Feature: syk-dashboard-ui, Property 4: Generación de alertas según condiciones de negocio
 *
 * Para cualquier conjunto de datos (pedidos activos y variantes de producto) y una fecha actual dada:
 * - Todo pedido activo con 0 < daysUntilDue ≤ 2 SHALL generar una alerta tipo 'due_soon' con severidad 'warning'
 * - Todo pedido activo con today > dueDate SHALL generar una alerta tipo 'overdue' con severidad 'critical'
 * - Toda variante con stock ≤ minStock SHALL generar una alerta tipo 'low_stock' con severidad 'warning'
 * - Ningún otro elemento SHALL generar alertas
 *
 * **Validates: Requirements 12.1, 12.2, 12.3**
 */

// --- Generators ---

const arbVariant: fc.Arbitrary<Variant> = fc.record({
  id: fc.uuid(),
  size: fc.constantFrom('XS', 'S', 'M', 'L', 'XL', 'XXL'),
  color: fc.constantFrom('Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'),
  stock: fc.integer({ min: 0, max: 500 }),
  minStock: fc.integer({ min: 1, max: 50 }),
});

const arbProduct: fc.Arbitrary<Product> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 20 }),
  category: fc.constantFrom('Camisas', 'Pantalones', 'Zapatos', 'Accesorios'),
  variants: fc.array(arbVariant, { minLength: 1, maxLength: 5 }),
});

function arbOrder(today: Date): fc.Arbitrary<Order> {
  // Generate dueDates relative to today: from -10 days to +30 days
  const arbDueDate = fc.integer({ min: -10, max: 30 }).map((offsetDays) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString();
  });

  return fc.record({
    id: fc.uuid(),
    number: fc.string({ minLength: 3, maxLength: 10 }).map((s) => `PED-${s}`),
    clientId: fc.uuid(),
    sellerId: fc.uuid(),
    lines: fc.constant([]),
    total: fc.integer({ min: 0, max: 100000 }),
    status: fc.constantFrom('activo' as const, 'entregado' as const),
    notes: fc.constant(''),
    dueDate: arbDueDate,
    createdAt: fc.constant(today.toISOString()),
    updatedAt: fc.constant(today.toISOString()),
  });
}

function arbAppData(today: Date): fc.Arbitrary<AppData> {
  return fc.record({
    clients: fc.constant([]),
    products: fc.array(arbProduct, { minLength: 0, maxLength: 5 }),
    quotations: fc.constant([]),
    orders: fc.array(arbOrder(today), { minLength: 0, maxLength: 10 }),
  });
}

// Generate reference dates using integer offsets to avoid invalid date issues
const arbToday = fc.integer({ min: 0, max: 3650 }).map((offsetDays) => {
  const base = new Date(2020, 0, 1);
  base.setDate(base.getDate() + offsetDays);
  return base;
});

describe('Feature: syk-dashboard-ui, Property 4: Generación de alertas según condiciones de negocio', () => {
  it('every active order with daysUntilDue <= 0 produces an overdue alert with critical severity', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbAppData(today))),
        ([today, data]) => {
          const alerts = computeAlerts(data, today);

          for (const order of data.orders) {
            if (order.status !== 'activo') continue;
            const daysUntilDue = diffDays(new Date(order.dueDate), today);

            if (daysUntilDue <= 0) {
              const matchingAlert = alerts.find(
                (a) =>
                  a.type === 'overdue' &&
                  a.severity === 'critical' &&
                  a.resourceType === 'order' &&
                  a.resourceId === order.id
              );
              expect(matchingAlert).toBeDefined();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('every active order with 0 < daysUntilDue <= 2 produces a due_soon alert with warning severity', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbAppData(today))),
        ([today, data]) => {
          const alerts = computeAlerts(data, today);

          for (const order of data.orders) {
            if (order.status !== 'activo') continue;
            const daysUntilDue = diffDays(new Date(order.dueDate), today);

            if (daysUntilDue > 0 && daysUntilDue <= 2) {
              const matchingAlert = alerts.find(
                (a) =>
                  a.type === 'due_soon' &&
                  a.severity === 'warning' &&
                  a.resourceType === 'order' &&
                  a.resourceId === order.id
              );
              expect(matchingAlert).toBeDefined();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('every variant with stock <= minStock produces a low_stock alert with warning severity', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbAppData(today))),
        ([today, data]) => {
          const alerts = computeAlerts(data, today);

          for (const product of data.products) {
            for (const variant of product.variants) {
              if (variant.stock <= variant.minStock) {
                const matchingAlert = alerts.find(
                  (a) =>
                    a.type === 'low_stock' &&
                    a.severity === 'warning' &&
                    a.resourceType === 'product' &&
                    a.resourceId === product.id
                );
                expect(matchingAlert).toBeDefined();
              }
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('no alerts are generated for orders/variants that do not meet alert conditions', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbAppData(today))),
        ([today, data]) => {
          const alerts = computeAlerts(data, today);

          // Every alert must correspond to a valid condition
          for (const alert of alerts) {
            if (alert.type === 'overdue') {
              const order = data.orders.find((o) => o.id === alert.resourceId);
              expect(order).toBeDefined();
              expect(order!.status).toBe('activo');
              const daysUntilDue = diffDays(new Date(order!.dueDate), today);
              expect(daysUntilDue).toBeLessThanOrEqual(0);
            } else if (alert.type === 'due_soon') {
              const order = data.orders.find((o) => o.id === alert.resourceId);
              expect(order).toBeDefined();
              expect(order!.status).toBe('activo');
              const daysUntilDue = diffDays(new Date(order!.dueDate), today);
              expect(daysUntilDue).toBeGreaterThan(0);
              expect(daysUntilDue).toBeLessThanOrEqual(2);
            } else if (alert.type === 'low_stock') {
              const product = data.products.find((p) => p.id === alert.resourceId);
              expect(product).toBeDefined();
              const hasLowStock = product!.variants.some(
                (v) => v.stock <= v.minStock
              );
              expect(hasLowStock).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

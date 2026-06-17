import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeAlerts } from '@/lib/computeAlerts';
import type { AppData, Order, Product, Variant } from '@/types/models';

/**
 * Feature: syk-dashboard-ui, Property 5: Ordenamiento de alertas por severidad
 *
 * Para cualquier conjunto de alertas con severidades mixtas, la lista ordenada
 * SHALL posicionar todas las alertas de severidad 'critical' antes que las de severidad 'warning'.
 *
 * **Validates: Requirements 12.5**
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

describe('Feature: syk-dashboard-ui, Property 5: Ordenamiento de alertas por severidad', () => {
  it('all critical alerts appear before all warning alerts in the result', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbAppData(today))),
        ([today, data]) => {
          const alerts = computeAlerts(data, today);

          // Once a 'warning' alert is seen, no 'critical' alert should come after it
          let seenWarning = false;
          for (const alert of alerts) {
            if (alert.severity === 'warning') {
              seenWarning = true;
            }
            if (alert.severity === 'critical' && seenWarning) {
              // A critical alert appeared after a warning — ordering is violated
              expect.fail(
                `Critical alert "${alert.message}" appeared after a warning alert, violating severity ordering`
              );
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

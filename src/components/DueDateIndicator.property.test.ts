import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeDueDateLevel } from '@/components/DueDateIndicator';
import { diffDays } from '@/lib/computeAlerts';

/**
 * Feature: syk-dashboard-ui, Property 6: Indicadores de fecha de entrega en pedidos
 *
 * Para cualquier pedido activo y una fecha actual dada:
 * - Si 0 < daysUntilDue ≤ 2, la fila SHALL mostrar indicador de advertencia (amarillo)
 * - Si today > dueDate, la fila SHALL mostrar indicador crítico (rojo)
 * - Si daysUntilDue > 2, la fila NO SHALL mostrar indicador
 *
 * **Validates: Requirements 7.2, 7.3**
 */

// --- Generators ---

const arbToday = fc.integer({ min: 0, max: 3650 }).map((offsetDays) => {
  const base = new Date(2020, 0, 1);
  base.setDate(base.getDate() + offsetDays);
  return base;
});

function arbDueDate(today: Date): fc.Arbitrary<string> {
  return fc.integer({ min: -10, max: 30 }).map((offsetDays) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString();
  });
}

describe('Feature: syk-dashboard-ui, Property 6: Indicadores de fecha de entrega en pedidos', () => {
  it('returns "critical" when today > dueDate (daysUntilDue <= 0)', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbDueDate(today))),
        ([today, dueDate]) => {
          const days = diffDays(new Date(dueDate), today);
          const level = computeDueDateLevel(dueDate, today);

          if (days <= 0) {
            expect(level).toBe('critical');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns "warning" when 0 < daysUntilDue <= 2', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbDueDate(today))),
        ([today, dueDate]) => {
          const days = diffDays(new Date(dueDate), today);
          const level = computeDueDateLevel(dueDate, today);

          if (days > 0 && days <= 2) {
            expect(level).toBe('warning');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns "none" when daysUntilDue > 2', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbDueDate(today))),
        ([today, dueDate]) => {
          const days = diffDays(new Date(dueDate), today);
          const level = computeDueDateLevel(dueDate, today);

          if (days > 2) {
            expect(level).toBe('none');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('indicator type is always consistent with diffDays logic', () => {
    fc.assert(
      fc.property(
        arbToday.chain((today) => fc.tuple(fc.constant(today), arbDueDate(today))),
        ([today, dueDate]) => {
          const days = diffDays(new Date(dueDate), today);
          const level = computeDueDateLevel(dueDate, today);

          if (days <= 0) {
            expect(level).toBe('critical');
          } else if (days <= 2) {
            expect(level).toBe('warning');
          } else {
            expect(level).toBe('none');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

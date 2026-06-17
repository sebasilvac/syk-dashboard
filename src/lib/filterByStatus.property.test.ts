import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filterByStatus } from '@/lib/filterByStatus';

/**
 * Feature: syk-dashboard-ui, Property 2: Filtrado por estado retorna solo elementos coincidentes
 *
 * Para cualquier colección de elementos con estado (cotizaciones o pedidos) y cualquier
 * filtro de estado válido, el resultado filtrado SHALL contener únicamente elementos
 * cuyo estado coincida exactamente con el filtro seleccionado.
 *
 * **Validates: Requirements 4.2, 7.4**
 */
describe('Feature: syk-dashboard-ui, Property 2: Filtrado por estado retorna solo elementos coincidentes', () => {
  const arbQuotationStatus = fc.constantFrom('borrador', 'pendiente', 'aprobada', 'rechazada');

  const arbItem = fc.record({
    id: fc.uuid(),
    status: arbQuotationStatus,
  });

  it('para cualquier array de items y cualquier filtro de estado válido, todos los resultados tienen ese estado', () => {
    fc.assert(
      fc.property(
        fc.array(arbItem, { minLength: 0, maxLength: 30 }),
        arbQuotationStatus,
        (items, selectedStatus) => {
          const result = filterByStatus(items, selectedStatus);
          for (const item of result) {
            expect(item.status).toBe(selectedStatus);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('para cualquier array de items y cualquier filtro de estado, el count de resultados es igual al count de items con ese estado en el original', () => {
    fc.assert(
      fc.property(
        fc.array(arbItem, { minLength: 0, maxLength: 30 }),
        arbQuotationStatus,
        (items, selectedStatus) => {
          const result = filterByStatus(items, selectedStatus);
          const expectedCount = items.filter((item) => item.status === selectedStatus).length;
          expect(result.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('cuando status es empty/null/undefined, todos los items son retornados', () => {
    const arbNullishStatus = fc.constantFrom('', null, undefined);

    fc.assert(
      fc.property(
        fc.array(arbItem, { minLength: 0, maxLength: 30 }),
        arbNullishStatus,
        (items, emptyStatus) => {
          const result = filterByStatus(items, emptyStatus);
          expect(result.length).toBe(items.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

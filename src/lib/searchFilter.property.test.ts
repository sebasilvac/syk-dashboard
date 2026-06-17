import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { searchFilter, searchProducts } from '@/lib/searchFilter';

/**
 * Feature: syk-dashboard-ui, Property 3: Búsqueda textual filtra correctamente
 *
 * Para cualquier cadena de búsqueda no vacía y cualquier conjunto de elementos
 * (cotizaciones, productos), los resultados SHALL contener únicamente elementos
 * donde el nombre del cliente (o nombre/categoría del producto) o el número de
 * documento contenga la cadena de búsqueda (case-insensitive).
 *
 * **Validates: Requirements 4.3, 10.4**
 */
describe('Feature: syk-dashboard-ui, Property 3: Búsqueda textual filtra correctamente', () => {
  const arbSearchQuery = fc.string({ minLength: 1, maxLength: 10 }).filter(s => s.trim().length > 0);

  const arbItem = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    code: fc.string({ minLength: 1, maxLength: 10 }),
  });

  const arbProduct = fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 20 }),
    category: fc.constantFrom('Poleras', 'Pantalones', 'Chaquetas', 'Vestidos'),
    variants: fc.constant([] as Array<{ id: string; size: string; color: string; stock: number; minStock: number }>),
  });

  it('todos los resultados contienen la query (case-insensitive) en al menos un campo', () => {
    fc.assert(
      fc.property(
        fc.array(arbItem, { minLength: 0, maxLength: 30 }),
        arbSearchQuery,
        (items, query) => {
          const result = searchFilter(items, query, (item) => [item.name, item.code]);
          const lowerQuery = query.trim().toLowerCase();

          for (const item of result) {
            const matchesAnyField =
              item.name.toLowerCase().includes(lowerQuery) ||
              item.code.toLowerCase().includes(lowerQuery);
            expect(matchesAnyField).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('query vacía retorna todos los items', () => {
    fc.assert(
      fc.property(
        fc.array(arbItem, { minLength: 0, maxLength: 30 }),
        (items) => {
          const result = searchFilter(items, '', (item) => [item.name, item.code]);
          expect(result.length).toBe(items.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('el count de resultados nunca excede el count original', () => {
    fc.assert(
      fc.property(
        fc.array(arbItem, { minLength: 0, maxLength: 30 }),
        arbSearchQuery,
        (items, query) => {
          const result = searchFilter(items, query, (item) => [item.name, item.code]);
          expect(result.length).toBeLessThanOrEqual(items.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('searchProducts: todos los resultados tienen name o category conteniendo la query', () => {
    fc.assert(
      fc.property(
        fc.array(arbProduct, { minLength: 0, maxLength: 30 }),
        arbSearchQuery,
        (products, query) => {
          const result = searchProducts(products, query);
          const lowerQuery = query.trim().toLowerCase();

          for (const product of result) {
            const matchesNameOrCategory =
              product.name.toLowerCase().includes(lowerQuery) ||
              product.category.toLowerCase().includes(lowerQuery);
            expect(matchesNameOrCategory).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

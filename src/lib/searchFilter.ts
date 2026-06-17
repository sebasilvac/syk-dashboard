import type { Client, Product, Quotation } from '@/types/models';

/**
 * Generic search function that filters items by a search query (case-insensitive)
 * over specified text fields.
 *
 * @param items - The collection to search through
 * @param query - The search string to match against
 * @param getSearchableFields - Function that extracts searchable text fields from each item
 * @returns Filtered array containing only items where at least one field contains the query
 */
export function searchFilter<T>(
  items: ReadonlyArray<T>,
  query: string,
  getSearchableFields: (item: T) => string[]
): T[] {
  const trimmed = query.trim();

  if (!trimmed) {
    return [...items];
  }

  const lowerQuery = trimmed.toLowerCase();

  return items.filter((item) => {
    const fields = getSearchableFields(item);
    return fields.some((field) => field.toLowerCase().includes(lowerQuery));
  });
}

/**
 * Filters quotations by client name or quotation number (case-insensitive).
 *
 * @param quotations - The quotations to search through
 * @param query - The search string to match
 * @param clients - Client list used to resolve client names by clientId
 * @returns Filtered quotations matching the query
 */
export function searchQuotations(
  quotations: ReadonlyArray<Quotation>,
  query: string,
  clients: ReadonlyArray<Client>
): Quotation[] {
  const clientMap = new Map(clients.map((c) => [c.id, c.name]));

  return searchFilter(quotations, query, (quotation) => [
    quotation.number,
    clientMap.get(quotation.clientId) ?? '',
  ]);
}

/**
 * Filters products by name or category (case-insensitive).
 *
 * @param products - The products to search through
 * @param query - The search string to match
 * @returns Filtered products matching the query
 */
export function searchProducts(
  products: ReadonlyArray<Product>,
  query: string
): Product[] {
  return searchFilter(products, query, (product) => [
    product.name,
    product.category,
  ]);
}

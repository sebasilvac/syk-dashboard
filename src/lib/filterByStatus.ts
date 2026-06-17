/**
 * Filters a collection of items by their status field.
 * If status is empty, null, or undefined (representing an "all" filter),
 * returns all items unfiltered.
 *
 * @param items - The collection to filter
 * @param status - The status value to match, or empty/null/undefined for "all"
 * @returns Filtered array containing only items with matching status
 */
export function filterByStatus<T extends { status: string }>(
  items: ReadonlyArray<T>,
  status: string | null | undefined
): T[] {
  if (!status) {
    return [...items];
  }

  return items.filter((item) => item.status === status);
}

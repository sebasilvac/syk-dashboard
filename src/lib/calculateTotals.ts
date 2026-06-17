/**
 * Cálculo de totales para líneas de producto en cotizaciones y pedidos.
 * Valida: Requerimientos 5.3, 5.5
 */

/**
 * Calcula el subtotal de una línea de producto.
 * @param quantity - Cantidad de unidades
 * @param unitPrice - Precio unitario
 * @returns subtotal (quantity × unitPrice)
 */
export function calculateSubtotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

/**
 * Calcula el total de un documento (cotización o pedido) sumando
 * los subtotales derivados de cada línea (quantity × unitPrice).
 * @param lines - Array de líneas con al menos quantity y unitPrice
 * @returns Suma de todos los subtotales
 */
export function calculateDocumentTotal(
  lines: ReadonlyArray<{ quantity: number; unitPrice: number }>
): number {
  return lines.reduce(
    (total, line) => total + calculateSubtotal(line.quantity, line.unitPrice),
    0
  );
}

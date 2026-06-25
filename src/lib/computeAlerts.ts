import type { Alert, AppData } from '@/types/models';

/**
 * Parse a date string as local midnight.
 * Handles both date-only strings ("2026-07-04") and full ISO timestamps.
 * Date-only strings are parsed as local time by appending T00:00:00.
 */
export function parseLocalDate(dateStr: string): Date {
  // Date-only format: "YYYY-MM-DD" (length 10, no 'T')
  if (dateStr.length === 10 && !dateStr.includes('T')) {
    return new Date(dateStr + 'T00:00:00');
  }
  return new Date(dateStr);
}

/**
 * Calculate the difference in calendar days between two dates.
 * Returns positive if target is in the future relative to from.
 */
export function diffDays(target: Date, from: Date): number {
  const targetDate = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const fromDate = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((targetDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
}

let alertCounter = 0;

function generateAlertId(): string {
  alertCounter += 1;
  return `alert-${Date.now()}-${alertCounter}`;
}

/**
 * Compute alerts based on business conditions:
 * - Active orders with dueDate <= 0 days → overdue (critical)
 * - Active orders with 0 < dueDate <= 2 days → due_soon (warning)
 * - Product variants with stock <= minStock → low_stock (warning)
 *
 * Results are sorted: critical first, warning second.
 */
export function computeAlerts(data: AppData, today: Date): Alert[] {
  const alerts: Alert[] = [];

  // Check active orders for overdue and due_soon
  for (const order of data.orders) {
    if (order.status !== 'activo') continue;

    const daysUntilDue = diffDays(parseLocalDate(order.dueDate), today);

    if (daysUntilDue <= 0) {
      alerts.push({
        id: generateAlertId(),
        type: 'overdue',
        severity: 'critical',
        message: `Pedido ${order.number} está atrasado`,
        resourceType: 'order',
        resourceId: order.id,
      });
    } else if (daysUntilDue <= 2) {
      alerts.push({
        id: generateAlertId(),
        type: 'due_soon',
        severity: 'warning',
        message: `Pedido ${order.number} vence en ${daysUntilDue} día${daysUntilDue === 1 ? '' : 's'}`,
        resourceType: 'order',
        resourceId: order.id,
      });
    }
  }

  // Check product variants for low stock
  for (const product of data.products) {
    for (const variant of product.variants) {
      if (variant.stock <= variant.minStock) {
        alerts.push({
          id: generateAlertId(),
          type: 'low_stock',
          severity: 'warning',
          message: `${product.name} (${variant.size}/${variant.color}) tiene stock bajo: ${variant.stock}/${variant.minStock}`,
          resourceType: 'product',
          resourceId: product.id,
        });
      }
    }
  }

  // Sort: critical first, then warning
  function severityWeight(severity: string): number {
    return severity === 'critical' ? 1 : 0;
  }
  alerts.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));

  return alerts;
}

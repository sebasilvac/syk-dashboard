import type { Variant } from '@/types/models';

interface LowStockIndicatorProps {
  variants: Variant[];
}

/**
 * Determine if any variant has low stock (stock <= minStock).
 */
export function hasLowStock(variants: Variant[]): boolean {
  return variants.some((v) => v.stock <= v.minStock);
}

export function LowStockIndicator({ variants }: LowStockIndicatorProps) {
  if (!hasLowStock(variants)) return null;

  return (
    <span
      className="low-stock-indicator"
      aria-label="Stock bajo"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: 'var(--radius)',
        color: 'var(--color-warning)',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </span>
  );
}

export type { LowStockIndicatorProps };

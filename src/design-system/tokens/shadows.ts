/** Maps to CSS custom properties defined in globals.css */
export const shadows = {
  none: 'none',
  soft: 'var(--shadow-soft)',
  elevated: 'var(--shadow-elevated)',
  glow: '0 0 12px rgba(192, 132, 160, 0.3)',
} as const;

export type ShadowKey = keyof typeof shadows;

import { cva } from '@/design-system/utils/cva';

export const cardVariants = cva({
  base: 'rounded-2xl transition-shadow duration-150',
  variants: {
    variant: {
      default: 'bg-surface shadow-soft',
      elevated: 'bg-surface shadow-elevated',
      outlined: 'bg-surface border border-secondary/30',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type CardVariant = keyof typeof cardVariants.variants.variant;

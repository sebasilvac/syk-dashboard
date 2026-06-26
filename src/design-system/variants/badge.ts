import { cva } from '@/design-system/utils/cva';

export const badgeVariants = cva({
  base: 'inline-flex items-center rounded-full font-medium',
  variants: {
    variant: {
      default: 'bg-secondary/30 text-text-muted',
      success: 'bg-success-muted text-success',
      warning: 'bg-warning-muted text-warning',
      destructive: 'bg-destructive-muted text-destructive',
      outline: 'border border-secondary text-text-muted',
    },
    size: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export type BadgeVariant = keyof typeof badgeVariants.variants.variant;
export type BadgeSize = keyof typeof badgeVariants.variants.size;

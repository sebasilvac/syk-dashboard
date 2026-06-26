import { cva } from '@/design-system/utils/cva';

export const buttonVariants = cva({
  base: 'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap rounded-md transition-all duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:pointer-events-none',
  variants: {
    variant: {
      primary: 'bg-accent text-white hover:bg-accent/90',
      secondary: 'bg-transparent border border-secondary text-text-muted hover:border-accent-soft hover:text-text-primary',
      destructive: 'bg-destructive text-white hover:bg-destructive/90',
      ghost: 'bg-transparent text-text-muted hover:text-text-primary hover:bg-bg-secondary',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export type ButtonVariant = keyof typeof buttonVariants.variants.variant;
export type ButtonSize = keyof typeof buttonVariants.variants.size;

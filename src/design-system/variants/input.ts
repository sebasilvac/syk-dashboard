import { cva } from '@/design-system/utils/cva';

export const inputVariants = cva({
  base: 'w-full rounded-md border bg-transparent px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed',
  variants: {
    state: {
      default: 'border-secondary',
      error: 'border-destructive focus-visible:ring-destructive',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

export type InputState = keyof typeof inputVariants.variants.state;

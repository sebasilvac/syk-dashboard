import { cva } from '@/design-system/utils/cva';

export const selectTriggerVariants = cva({
  base: 'relative w-full inline-flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  variants: {
    state: {
      default: 'border-secondary bg-bg-secondary text-text-primary hover:border-accent-soft',
      open: 'border-accent bg-bg-secondary text-text-primary ring-2 ring-accent ring-offset-2 ring-offset-bg-primary',
      error: 'border-destructive bg-bg-secondary text-text-primary',
    },
  },
  defaultVariants: {
    state: 'default',
  },
});

export type SelectTriggerState = keyof typeof selectTriggerVariants.variants.state;

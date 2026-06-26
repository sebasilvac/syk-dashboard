import { cva } from '@/design-system/utils/cva';

export const tabsListVariants = cva({
  base: 'inline-flex items-center gap-1 rounded-md bg-bg-secondary p-1',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const tabsTriggerVariants = cva({
  base: 'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50',
  variants: {
    state: {
      active: 'bg-surface text-text-primary shadow-soft',
      inactive: 'text-text-muted hover:text-text-primary',
    },
  },
  defaultVariants: {
    state: 'inactive',
  },
});

export type TabsListSize = keyof typeof tabsListVariants.variants.size;
export type TabsTriggerState = keyof typeof tabsTriggerVariants.variants.state;

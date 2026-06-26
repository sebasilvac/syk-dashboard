import { cva } from '@/design-system/utils/cva';

export const tableVariants = cva({
  base: 'w-full caption-bottom text-sm',
  variants: {
    variant: {
      default: '',
      striped: '[&_tbody_tr:nth-child(even)]:bg-bg-secondary/50',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const tableRowVariants = cva({
  base: 'border-b border-secondary/20 transition-colors',
  variants: {
    interactive: {
      true: 'cursor-pointer hover:bg-bg-secondary/50',
      false: '',
    },
  },
  defaultVariants: {
    interactive: 'false',
  },
});

export type TableVariant = keyof typeof tableVariants.variants.variant;
export type TableRowInteractive = keyof typeof tableRowVariants.variants.interactive;

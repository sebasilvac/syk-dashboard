import { cva } from '@/design-system/utils/cva';

export const tableWrapperVariants = cva({
  base: 'bg-surface rounded-2xl shadow-soft overflow-hidden border border-secondary/20',
  variants: {
    variant: {
      default: '',
      elevated: 'shadow-elevated',
      flat: 'shadow-none border-none bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const tableVariants = cva({
  base: 'w-full border-collapse text-sm',
  variants: {
    variant: {
      default: '',
      striped: '[&_tbody_tr:nth-child(even)]:bg-bg-secondary/30',
      compact: '[&_th]:px-3 [&_th]:py-2 [&_td]:px-3 [&_td]:py-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const tableHeaderVariants = cva({
  base: 'bg-bg-secondary/60',
  variants: {
    variant: {
      default: '',
      bold: 'bg-bg-secondary',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export const tableHeadCellVariants = cva({
  base: 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted whitespace-nowrap select-none',
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    align: 'left',
  },
});

export const tableRowVariants = cva({
  base: 'border-b border-secondary/15 transition-colors duration-150 last:border-b-0',
  variants: {
    interactive: {
      true: 'cursor-pointer hover:bg-bg-secondary/50 focus-visible:bg-bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
      false: '',
    },
  },
  defaultVariants: {
    interactive: 'false',
  },
});

export const tableCellVariants = cva({
  base: 'px-4 py-3.5 align-middle text-text-primary',
  variants: {
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    align: 'left',
  },
});

export type TableWrapperVariant = keyof typeof tableWrapperVariants.variants.variant;
export type TableVariant = keyof typeof tableVariants.variants.variant;
export type TableHeaderVariant = keyof typeof tableHeaderVariants.variants.variant;
export type TableHeadCellAlign = keyof typeof tableHeadCellVariants.variants.align;
export type TableRowInteractive = keyof typeof tableRowVariants.variants.interactive;
export type TableCellAlign = keyof typeof tableCellVariants.variants.align;

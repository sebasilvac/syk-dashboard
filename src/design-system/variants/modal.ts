import { cva } from '@/design-system/utils/cva';

export const modalVariants = cva({
  base: 'w-full max-h-[85vh] flex flex-col bg-surface rounded-2xl shadow-elevated',
  variants: {
    size: {
      sm: 'max-w-[400px]',
      md: 'max-w-[520px]',
      lg: 'max-w-[720px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type ModalSize = keyof typeof modalVariants.variants.size;

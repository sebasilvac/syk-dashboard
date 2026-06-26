import { type ReactNode } from 'react';
import { BaseBadge } from '@/design-system/primitives/badge';
import { badgeVariants, type BadgeVariant, type BadgeSize } from '@/design-system/variants/badge';
import { cn } from '@/design-system/utils/cn';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

export function Badge({
  variant,
  size,
  children,
  className,
}: BadgeProps): ReactNode {
  return (
    <BaseBadge className={cn(badgeVariants({
      ...(variant !== undefined && { variant }),
      ...(size !== undefined && { size }),
    }), className)}>
      {children}
    </BaseBadge>
  );
}

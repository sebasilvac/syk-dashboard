import { type ReactNode } from 'react';
import { BaseCard, BaseCardHeader, BaseCardContent, BaseCardFooter } from '@/design-system/primitives/card';
import { cardVariants, type CardVariant } from '@/design-system/variants/card';
import { cn } from '@/design-system/utils/cn';

export interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  variant?: CardVariant;
  className?: string;
}

export function Card({
  title,
  description,
  children,
  footer,
  variant,
  className,
}: CardProps): ReactNode {
  return (
    <BaseCard className={cn(cardVariants({ ...(variant !== undefined && { variant }) }), className)}>
      {(title || description) && (
        <BaseCardHeader className="p-4 pb-0">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {description && <p className="text-sm text-text-muted">{description}</p>}
        </BaseCardHeader>
      )}
      <BaseCardContent className="p-4">
        {children}
      </BaseCardContent>
      {footer && (
        <BaseCardFooter className="border-t border-secondary/20 p-4">
          {footer}
        </BaseCardFooter>
      )}
    </BaseCard>
  );
}

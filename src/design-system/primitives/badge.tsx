import { forwardRef, type HTMLAttributes } from 'react';

export interface BaseBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export const BaseBadge = forwardRef<HTMLSpanElement, BaseBadgeProps>(
  function BaseBadge({ className, ...props }, ref) {
    return <span ref={ref} className={className} {...props} />;
  }
);

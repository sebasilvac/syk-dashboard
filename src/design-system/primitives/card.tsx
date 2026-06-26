import { forwardRef, type HTMLAttributes } from 'react';

export interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const BaseCard = forwardRef<HTMLDivElement, BaseCardProps>(
  function BaseCard({ className, ...props }, ref) {
    return <div ref={ref} className={className} {...props} />;
  }
);

export const BaseCardHeader = forwardRef<HTMLDivElement, BaseCardProps>(
  function BaseCardHeader({ className, ...props }, ref) {
    return <div ref={ref} className={className} {...props} />;
  }
);

export const BaseCardContent = forwardRef<HTMLDivElement, BaseCardProps>(
  function BaseCardContent({ className, ...props }, ref) {
    return <div ref={ref} className={className} {...props} />;
  }
);

export const BaseCardFooter = forwardRef<HTMLDivElement, BaseCardProps>(
  function BaseCardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={className} {...props} />;
  }
);

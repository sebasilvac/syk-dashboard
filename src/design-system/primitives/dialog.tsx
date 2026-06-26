import { forwardRef, type HTMLAttributes } from 'react';

export interface BaseDialogOverlayProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const BaseDialogOverlay = forwardRef<HTMLDivElement, BaseDialogOverlayProps>(
  function BaseDialogOverlay({ className, ...props }, ref) {
    return <div ref={ref} className={className} {...props} />;
  }
);

export interface BaseDialogContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export const BaseDialogContent = forwardRef<HTMLDivElement, BaseDialogContentProps>(
  function BaseDialogContent({ className, ...props }, ref) {
    return <div ref={ref} className={className} {...props} />;
  }
);

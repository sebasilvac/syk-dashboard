import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  function BaseButton({ className, ...props }, ref) {
    return <button ref={ref} className={className} {...props} />;
  }
);

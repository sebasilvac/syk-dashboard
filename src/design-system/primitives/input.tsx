import { forwardRef, type InputHTMLAttributes } from 'react';

export interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
  function BaseInput({ className, ...props }, ref) {
    return <input ref={ref} className={className} {...props} />;
  }
);

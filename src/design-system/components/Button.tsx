import { type ReactNode } from 'react';
import { BaseButton } from '@/design-system/primitives/button';
import { buttonVariants, type ButtonVariant, type ButtonSize } from '@/design-system/variants/button';
import { cn } from '@/design-system/utils/cn';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string
  'aria-label'?: string;
}

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  children,
  type = 'button',
  onClick,
  className,
  'aria-label': ariaLabel,
}: ButtonProps): ReactNode {
  return (
    <BaseButton
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      className={cn(
        buttonVariants({
          ...(variant !== undefined && { variant }),
          ...(size !== undefined && { size }),
        }),
        loading && 'pointer-events-none',
        className,
      )}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </BaseButton>
  );
}

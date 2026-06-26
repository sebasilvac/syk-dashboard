import { type ChangeEvent, type ReactNode } from 'react';
import { BaseInput } from '@/design-system/primitives/input';
import { inputVariants } from '@/design-system/variants/input';
import { cn } from '@/design-system/utils/cn';

export interface InputProps {
  label: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  id?: string;
  name?: string;
}

export function Input({
  label,
  error,
  placeholder,
  disabled,
  value,
  onChange,
  type = 'text',
  id,
  name,
}: InputProps): ReactNode {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
        {label}
      </label>
      <BaseInput
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        className={cn(inputVariants({ state: error ? 'error' : 'default' }))}
      />
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

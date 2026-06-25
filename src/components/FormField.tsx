import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  errorId?: string;
}

const inputBase = [
  '[&_input]:bg-bg-secondary [&_input]:border [&_input]:border-secondary [&_input]:rounded-xl',
  '[&_input]:text-text-primary [&_input]:placeholder:text-secondary',
  '[&_input]:focus:border-accent [&_input]:focus:shadow-glow',
  '[&_input]:transition-all [&_input]:duration-150 [&_input]:px-3 [&_input]:py-2',
].join(' ');

const selectBase = [
  '[&_select]:bg-bg-secondary [&_select]:border [&_select]:border-secondary [&_select]:rounded-xl',
  '[&_select]:text-text-primary',
  '[&_select]:focus:border-accent [&_select]:focus:shadow-glow',
  '[&_select]:transition-all [&_select]:duration-150 [&_select]:px-3 [&_select]:py-2',
].join(' ');

const textareaBase = [
  '[&_textarea]:bg-bg-secondary [&_textarea]:border [&_textarea]:border-secondary [&_textarea]:rounded-xl',
  '[&_textarea]:text-text-primary [&_textarea]:placeholder:text-secondary',
  '[&_textarea]:focus:border-accent [&_textarea]:focus:shadow-glow',
  '[&_textarea]:transition-all [&_textarea]:duration-150 [&_textarea]:px-3 [&_textarea]:py-2',
].join(' ');

const errorBorder =
  '[&_input]:border-destructive [&_select]:border-destructive [&_textarea]:border-destructive';

export function FormField({ label, error, children, htmlFor, errorId }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-muted" htmlFor={htmlFor}>
        {label}
      </label>
      <div
        className={`flex flex-col ${inputBase} ${selectBase} ${textareaBase} ${error ? errorBorder : ''}`}
      >
        {children}
      </div>
      {error && (
        <p id={errorId} className="text-destructive text-sm m-0" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export type { FormFieldProps };

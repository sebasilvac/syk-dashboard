interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled,
  id,
}: SelectProps) {
  return (
    <div className="relative inline-flex w-full">
      <select
        id={id}
        className="w-full py-2 pl-4 pr-10 font-sans text-sm text-text-primary bg-bg-secondary border border-secondary rounded-xl appearance-none cursor-pointer outline-none transition-all duration-150 focus:border-accent focus:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <svg
        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

export type { SelectOption, SelectProps };

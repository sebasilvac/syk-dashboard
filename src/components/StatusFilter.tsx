interface StatusOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  options: StatusOption[];
  value: string;
  onChange: (value: string) => void;
}

export function StatusFilter({ options, value, onChange }: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center" role="group" aria-label="Filtro de estado">
      <button
        type="button"
        className={`px-4 py-1.5 font-sans text-[0.8125rem] font-medium rounded-xl border cursor-pointer whitespace-nowrap transition-all duration-150 ${
          value === ''
            ? 'text-white bg-accent border-accent'
            : 'text-text-muted bg-transparent border-secondary hover:text-text-primary hover:border-accent-soft'
        }`}
        onClick={() => onChange('')}
        aria-pressed={value === ''}
      >
        Todos
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`px-4 py-1.5 font-sans text-[0.8125rem] font-medium rounded-xl border cursor-pointer whitespace-nowrap transition-all duration-150 ${
            value === option.value
              ? 'text-white bg-accent border-accent'
              : 'text-text-muted bg-transparent border-secondary hover:text-text-primary hover:border-accent-soft'
          }`}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export type { StatusOption, StatusFilterProps };

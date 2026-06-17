import './StatusFilter.css';

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
    <div className="status-filter" role="group" aria-label="Filtro de estado">
      <button
        type="button"
        className={`status-filter__btn ${value === '' ? 'status-filter__btn--active' : ''}`}
        onClick={() => onChange('')}
        aria-pressed={value === ''}
      >
        Todos
      </button>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`status-filter__btn ${value === option.value ? 'status-filter__btn--active' : ''}`}
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

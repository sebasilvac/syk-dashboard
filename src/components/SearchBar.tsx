import { useRef, useCallback } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...' }: SearchBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        onChange(newValue);
      }, 300);
    },
    [onChange],
  );

  return (
    <div className="relative flex items-center w-full max-w-[400px]">
      <svg
        className="absolute left-4 text-text-muted pointer-events-none"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        className="w-full py-2 px-4 pl-11 font-sans text-sm text-text-primary bg-bg-secondary border border-secondary rounded-xl outline-none transition-all duration-150 placeholder:text-secondary focus:border-accent focus:shadow-glow [&::-webkit-search-cancel-button]:appearance-none"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}

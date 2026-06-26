import { useState, useRef, useEffect, useId, useCallback, type ReactNode } from 'react';
import { selectTriggerVariants } from '@/design-system/variants/select';
import { cn } from '@/design-system/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  error?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled = false,
  id,
  error = false,
  className,
}: SelectProps): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const generatedId = useId();
  const selectId = id || `select-${generatedId}`;
  const listboxId = `${selectId}-listbox`;

  const selectedOption = options.find((opt) => opt.value === value);

  const triggerState = error ? 'error' : isOpen ? 'open' : 'default';

  const open = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    const currentIndex = options.findIndex((opt) => opt.value === value);
    setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
  }, [disabled, options, value]);

  const close = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  const selectOption = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      close();
    },
    [onChange, close],
  );

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Scroll focused option into view
  useEffect(() => {
    if (!isOpen || focusedIndex < 0) return;
    const list = listRef.current;
    if (!list) return;
    const focusedEl = list.children[focusedIndex] as HTMLElement | undefined;
    focusedEl?.scrollIntoView({ block: 'nearest' });
  }, [isOpen, focusedIndex]);

  function handleTriggerKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          open();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          open();
        }
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;
    }
  }

  function handleListKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedIndex >= 0 && options[focusedIndex]) {
          selectOption(options[focusedIndex].value);
        }
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        close();
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(options.length - 1);
        break;
    }
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={selectedOption ? selectedOption.label : placeholder}
        disabled={disabled}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleTriggerKeyDown}
        className={selectTriggerVariants({ state: triggerState })}
      >
        <span className={cn('truncate', !selectedOption && 'text-text-muted/60')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={cn(
            'ml-2 h-4 w-4 shrink-0 text-text-muted transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
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
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={selectId}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="absolute z-50 mt-1.5 w-full origin-top rounded-2xl border border-secondary bg-surface p-1 shadow-elevated animate-[dropdown-in_150ms_ease-out]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = index === focusedIndex;
            return (
              <li
                key={option.value}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                data-focused={isFocused || undefined}
                onClick={() => selectOption(option.value)}
                onMouseEnter={() => setFocusedIndex(index)}
                className={cn(
                  'flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors duration-100',
                  isFocused && 'bg-accent/10',
                  isSelected && !isFocused && 'text-accent',
                  !isFocused && !isSelected && 'text-text-primary',
                )}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <svg
                    className="h-4 w-4 shrink-0 text-accent"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

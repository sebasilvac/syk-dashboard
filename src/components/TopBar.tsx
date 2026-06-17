import { AlertBell } from '@/components/AlertBell';
import { ThemeToggle } from '@/components/ThemeToggle';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 lg:px-6 bg-bg-primary border-b border-surface">
      <button
        className="md:hidden flex items-center justify-center p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors duration-150 cursor-pointer bg-transparent border-none"
        onClick={onMenuToggle}
        aria-label="Abrir menú"
        type="button"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="hidden md:flex flex-1 items-center">
        <span className="text-sm text-text-muted">Buscar...</span>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <AlertBell />
      </div>
    </header>
  );
}

import { AlertBell } from '@/components/AlertBell';
import './TopBar.css';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className="topbar">
      <button
        className="topbar__hamburger"
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

      <div className="topbar__breadcrumb" aria-label="Breadcrumb">
        {/* Breadcrumb placeholder — pages can fill this as needed */}
      </div>

      <div className="topbar__actions">
        <AlertBell />
      </div>
    </header>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useAlerts } from '@/lib/AlertContext';
import { AlertPanel } from '@/components/AlertPanel';
import './AlertBell.css';

export function AlertBell() {
  const { alerts, alertCount } = useAlerts();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleToggle() {
    setIsOpen((prev) => !prev);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="alert-bell" ref={containerRef}>
      <button
        className="alert-bell__button"
        onClick={handleToggle}
        aria-label={`Alertas: ${alertCount} activas`}
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {alertCount > 0 && (
          <span className="alert-bell__badge">{alertCount}</span>
        )}
      </button>
      {isOpen && <AlertPanel alerts={alerts} onClose={() => setIsOpen(false)} />}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useAlerts } from '@/lib/AlertContext';
import { AlertPanel } from '@/components/AlertPanel';

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
    <div className="relative" ref={containerRef}>
      <button
        className="relative flex items-center justify-center rounded-full p-2 text-text-muted hover:text-text-primary transition-colors duration-150 cursor-pointer bg-transparent border-none"
        onClick={handleToggle}
        aria-label={`Alertas: ${alertCount} activas`}
        type="button"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {alertCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 text-[0.625rem] font-bold leading-4 text-center text-white bg-destructive rounded-full">
            {alertCount}
          </span>
        )}
      </button>
      {isOpen && <AlertPanel alerts={alerts} onClose={() => setIsOpen(false)} />}
    </div>
  );
}

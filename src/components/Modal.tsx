import { useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) {
    return null;
  }

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-[modal-overlay-in_150ms_ease]"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="w-full max-w-[520px] max-h-[85vh] flex flex-col bg-surface rounded-2xl shadow-elevated animate-[modal-in_150ms_ease]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="flex items-center justify-between p-6 border-b border-secondary/50">
          <h2 id="modal-title" className="text-lg font-semibold text-text-primary m-0">
            {title}
          </h2>
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-xl text-text-muted cursor-pointer transition-all duration-150 hover:bg-bg-secondary hover:text-text-primary"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <svg
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export type { ModalProps };

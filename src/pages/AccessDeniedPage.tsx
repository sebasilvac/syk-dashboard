import { useNavigate } from 'react-router-dom';
import { Button } from '@/design-system/components/Button';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  function handleGoToDashboard() {
    navigate('/dashboard');
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-bg-primary p-6">
      <div className="bg-bg-secondary rounded-2xl shadow-elevated border border-surface p-8 w-full max-w-md text-center">
        <svg
          className="w-12 h-12 text-destructive mx-auto mb-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Acceso Denegado</h1>
        <p className="text-sm text-text-muted mb-8 max-w-sm mx-auto">
          No tienes permisos para acceder a esta sección. Contacta al administrador si crees que es un error.
        </p>
        <Button variant="primary" onClick={handleGoToDashboard}>
          Volver al Dashboard
        </Button>
      </div>
    </main>
  );
}

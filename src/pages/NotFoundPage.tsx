import { useNavigate } from 'react-router-dom';
import { Button } from '@/design-system/components/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  function handleGoBack() {
    navigate(-1);
  }

  function handleGoHome() {
    navigate('/dashboard');
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-bg-primary p-6">
      <div className="bg-bg-secondary rounded-2xl shadow-elevated border border-surface p-8 w-full max-w-md text-center">
        <span className="block font-bold text-6xl text-secondary leading-none mb-4">404</span>
        <h1 className="text-2xl font-bold text-text-primary mb-2">No Encontrado</h1>
        <p className="text-sm text-text-muted mb-8 max-w-sm mx-auto">
          El recurso que buscas no existe o fue eliminado.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={handleGoBack}>
            Volver
          </Button>
          <Button variant="primary" onClick={handleGoHome}>
            Ir al Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}

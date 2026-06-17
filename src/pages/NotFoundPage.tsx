import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  function handleGoBack() {
    navigate(-1);
  }

  function handleGoHome() {
    navigate('/dashboard');
  }

  return (
    <div className="not-found">
      <span className="not-found__code">404</span>
      <h1 className="not-found__title">No Encontrado</h1>
      <p className="not-found__message">
        El recurso que buscas no existe o fue eliminado.
      </p>
      <div className="not-found__actions">
        <Button variant="secondary" onClick={handleGoBack}>
          Volver
        </Button>
        <Button variant="primary" onClick={handleGoHome}>
          Ir al Dashboard
        </Button>
      </div>
    </div>
  );
}

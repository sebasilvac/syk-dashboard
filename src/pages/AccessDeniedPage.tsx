import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/Button';
import './AccessDeniedPage.css';

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  function handleGoToDashboard() {
    navigate('/dashboard');
  }

  return (
    <div className="access-denied">
      <svg
        className="access-denied__icon"
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
      <h1 className="access-denied__title">Acceso Denegado</h1>
      <p className="access-denied__message">
        No tienes permisos para acceder a esta sección. Contacta al administrador si crees que es un error.
      </p>
      <Button variant="primary" onClick={handleGoToDashboard}>
        Volver al Dashboard
      </Button>
    </div>
  );
}

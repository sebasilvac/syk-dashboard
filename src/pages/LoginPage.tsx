import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import type { Role } from '@/types/models';
import './LoginPage.css';

const ROLES: { value: Role; description: string }[] = [
  { value: 'admin', description: 'Acceso completo a todas las funcionalidades' },
  { value: 'vendedor', description: 'Crear cotizaciones, pedidos y ver inventario' },
];

export default function LoginPage() {
  const { state, login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    if (state.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [state.isAuthenticated, navigate]);

  function handleConfirm() {
    if (selectedRole) {
      login(selectedRole);
    }
  }

  return (
    <main className="login">
      <div className="login__card">
        <h1 className="login__title">SYK Dashboard</h1>
        <p className="login__subtitle">Selecciona tu rol para continuar</p>

        <fieldset className="login__roles">
          <legend className="sr-only">Seleccionar rol</legend>
          {ROLES.map(({ value, description }) => (
            <label
              key={value}
              className={`login__role${selectedRole === value ? ' login__role--selected' : ''}`}
            >
              <input
                type="radio"
                name="role"
                value={value}
                className="login__role-input"
                checked={selectedRole === value}
                onChange={() => setSelectedRole(value)}
              />
              <span className="login__role-info">
                <span className="login__role-name">{value}</span>
                <span className="login__role-desc">{description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <Button
          variant="primary"
          size="lg"
          className="login__submit"
          disabled={!selectedRole}
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </div>
    </main>
  );
}

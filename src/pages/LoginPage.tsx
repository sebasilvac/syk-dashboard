import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import type { Role } from '@/types/models';

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
    <main className="min-h-dvh flex items-center justify-center bg-bg-primary p-6">
      <div className="bg-bg-secondary rounded-2xl shadow-elevated border border-surface p-8 w-full max-w-md">
        <h1 className="text-center text-2xl font-bold text-text-primary mb-1">SYK Dashboard</h1>
        <p className="text-center text-sm text-text-muted mb-6">Selecciona tu rol para continuar</p>

        <fieldset className="flex flex-col gap-3 mb-6 border-none p-0 m-0">
          <legend className="sr-only">Seleccionar rol</legend>
          {ROLES.map(({ value, description }) => (
            <label
              key={value}
              className={`flex items-center gap-4 px-4 py-3 border rounded-xl cursor-pointer transition-all duration-150 ${
                selectedRole === value
                  ? 'border-accent bg-accent/5'
                  : 'border-secondary hover:border-accent-soft hover:bg-surface/30'
              }`}
            >
              <input
                type="radio"
                name="role"
                value={value}
                className="accent-accent w-[18px] h-[18px] shrink-0"
                checked={selectedRole === value}
                onChange={() => setSelectedRole(value)}
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-semibold text-[0.9375rem] text-text-primary capitalize">
                  {value}
                </span>
                <span className="text-[0.8125rem] text-text-muted">{description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!selectedRole}
          onClick={handleConfirm}
        >
          Confirmar
        </Button>
      </div>
    </main>
  );
}

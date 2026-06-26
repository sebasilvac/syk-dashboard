import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/design-system/components/Button';
import { Input } from '@/design-system/components/Input';

export default function LoginPage() {
  const { state, login } = useSupabaseAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state.loading && state.isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [state.isAuthenticated, state.loading, navigate]);

  if (state.loading) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-bg-primary">
        <p className="text-text-muted">Cargando...</p>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-dvh flex items-center justify-center bg-bg-primary p-6">
      <div className="bg-bg-secondary rounded-2xl shadow-elevated border border-surface p-8 w-full max-w-md">
        <h1 className="text-center text-2xl font-bold text-text-primary mb-1">SYK Dashboard</h1>
        <p className="text-center text-sm text-text-muted mb-6">
          Inicia sesión para continuar
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />

          <Input
            label="Contraseña"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p className="text-sm text-destructive bg-destructive-muted px-3 py-2 rounded-lg" role="alert">
              {error}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-2"
            disabled={loading || !email || !password}
            type="submit"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </main>
  );
}

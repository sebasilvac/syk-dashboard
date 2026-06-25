import type { Role, User } from './models';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface AuthContextValue {
  state: AuthState;
  login: (role: Role) => void;
  logout: () => void;
}

export interface SupabaseAuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface SupabaseAuthContextValue {
  state: SupabaseAuthState;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
}

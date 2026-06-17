import type { Role, User } from './models';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AuthContextValue {
  state: AuthState;
  login: (role: Role) => void;
  logout: () => void;
}

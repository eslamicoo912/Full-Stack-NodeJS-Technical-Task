import { useEffect, useState, type ReactNode } from 'react';
import { AuthContext } from './auth-context';
import { getMeApi } from '../../api/auth.api';
import { getToken, setToken, clearToken } from '../../lib/token';
import type { User } from '../../types/user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!getToken());

  // Restore the session on page load if a token is stored
  useEffect(() => {
    if (!getToken()) {
      return;
    }
    getMeApi()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = (loggedInUser: User, token: string) => {
    setToken(token);
    setUser(loggedInUser);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

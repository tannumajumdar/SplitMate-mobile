import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, tokenStore } from '../services/api';
import type { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await tokenStore.load();
      if (token) {
        try {
          const me = await authApi.me();
          setUser(me);
        } catch {
          tokenStore.clear();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = (u: AuthUser, token: string) => {
    tokenStore.set(token);
    setUser(u);
  };

  const logout = () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

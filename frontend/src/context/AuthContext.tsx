import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../types/auth.js';
import { getMe } from '../api/auth.js';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('meditrack_token');
    if (!stored) { setLoading(false); return; }

    getMe(stored)
      .then((u) => { setToken(stored); setUser(u); })
      .catch(() => localStorage.removeItem('meditrack_token'))
      .finally(() => setLoading(false));
  }, []);

  function setAuth(t: string, u: AuthUser) {
    localStorage.setItem('meditrack_token', t);
    setToken(t);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('meditrack_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

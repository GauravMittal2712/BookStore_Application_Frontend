import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/index.js';
import { setAccessToken, setAuthLostHandler, refreshSession } from '../api/client.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const applySession = useCallback((data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setAuthLostHandler(() => clearSession());
    (async () => {
      try {
        const data = await refreshSession();
        applySession(data);
      } catch {
        clearSession();
      } finally {
        setReady(true);
      }
    })();
  }, [applySession, clearSession]);

  const login = useCallback(
    async (email, password) => {
      const r = await authApi.login({ email, password });
      applySession(r.data);
      return r.data.user;
    },
    [applySession]
  );

  const register = useCallback(
    async (body) => {
      const r = await authApi.register(body);
      applySession(r.data);
      return r.data.user;
    },
    [applySession]
  );

  const loginWithGoogle = useCallback(
    async (idToken) => {
      const r = await authApi.google(idToken);
      applySession(r.data);
      return r.data.user;
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    clearSession();
  }, [clearSession]);

    const value = useMemo(
    () => ({ user, ready, login, register, loginWithGoogle, logout, setUser, forget: clearSession }),
    [user, ready, login, register, loginWithGoogle, logout, clearSession]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
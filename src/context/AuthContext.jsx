import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/index.js';
import { refreshSession, setAccessToken, setAuthLostHandler } from '../api/client.js';

const FLAG = 'bs_has_session';
const flag = {
  get: () => { try { return localStorage.getItem(FLAG) === '1'; } catch { return false; } },
  set: () => { try { localStorage.setItem(FLAG, '1'); } catch { /* ignore */ } },
  clear: () => { try { localStorage.removeItem(FLAG); } catch { /* ignore */ } },
};

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthLostHandler(() => { setUser(null); flag.clear(); });
    // Only try to restore a session if this browser has logged in before: the auth routes are
    // rate limited (10 / 15 min), so we don't spend one on every anonymous page load.
    if (!flag.get()) { setReady(true); return undefined; }
    let alive = true;
    refreshSession()
      .then((d) => { if (alive) setUser(d.user); })
      .catch(() => flag.clear())
      .finally(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  const finish = (data) => {
    setAccessToken(data.accessToken);
    setUser(data.user);
    flag.set();
    return data.user;
  };
  const login = useCallback(async (email, password) => finish((await authApi.login({ email, password })).data), []);
  const register = useCallback(async (body) => finish((await authApi.register(body)).data), []);
  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* session may already be gone */ }
    setAccessToken(null);
    setUser(null);
    flag.clear();
  }, []);
  const forget = useCallback(() => { setAccessToken(null); setUser(null); flag.clear(); }, []);

  const value = useMemo(() => ({ user, ready, setUser, login, register, logout, forget }), [user, ready, login, register, logout, forget]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

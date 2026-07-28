import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  api,
  clearAuth,
  getStoredProfileId,
  getStoredUser,
  getToken,
  setAuth,
  setStoredProfileId,
} from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [profileId, setProfileId] = useState(getStoredProfileId());
  const [token, setToken] = useState(getToken());
  const [booting, setBooting] = useState(Boolean(getToken()));

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!getToken()) {
        setBooting(false);
        return;
      }
      try {
        const me = await api.me();
        if (cancelled) return;
        setUser(me.user);
        setProfileId(me.profile_id);
        setStoredProfileId(me.profile_id);
        setAuth({ user: me.user, profile_id: me.profile_id });
      } catch {
        if (!cancelled) {
          clearAuth();
          setUser(null);
          setProfileId(null);
          setToken(null);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    }
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await api.login({ email, password });
    setAuth(result);
    setToken(result.token);
    setUser(result.user);
    setProfileId(result.profile_id);
    return result;
  }, []);

  const signup = useCallback(async (email, password) => {
    const result = await api.signup({ email, password });
    setAuth(result);
    setToken(result.token);
    setUser(result.user);
    setProfileId(result.profile_id);
    return result;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setToken(null);
    setUser(null);
    setProfileId(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      profileId,
      setProfileId,
      booting,
      isAuthenticated: Boolean(token && user),
      login,
      signup,
      logout,
    }),
    [user, token, profileId, booting, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

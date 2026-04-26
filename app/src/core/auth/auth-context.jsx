import { useCallback, useEffect, useMemo, useState } from "react";
import { login as loginApi, logout as logoutApi, me, signup as signupApi } from "../api/auth-api";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./storage";
import { AuthContext } from "./auth-context-store";

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!getAccessToken()) {
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const profile = await me();
        if (!cancelled) setUser(profile);
      } catch {
        clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function signIn(email, password) {
    const data = await loginApi({ email, password });
    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
  }

  async function signUp(name, email, password) {
    const data = await signupApi({ name, email, password });
    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
  }

  async function signOut() {
    const refresh = getRefreshToken();
    try {
      if (refresh) await logoutApi(refresh);
    } catch {
      // no-op
    } finally {
      clearTokens();
      setUser(null);
    }
  }

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) return null;
    try {
      const profile = await me();
      setUser(profile);
      return profile;
    } catch {
      clearTokens();
      setUser(null);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ ready, user, signIn, signUp, signOut, refreshUser }),
    [ready, user, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

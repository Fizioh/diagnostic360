import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isMissionApiConfigured, missionApiFetch } from "../../integrations/auth/missionApi";

type AuthState = "loading" | "locked" | "authenticated";

interface AuthContextValue {
  state: AuthState;
  login: (passphrase: string) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>("loading");

  const refreshSession = useCallback(async () => {
    if (!isMissionApiConfigured()) {
      setState("locked");
      return;
    }
    const res = await missionApiFetch("/auth/session");
    setState(res.ok ? "authenticated" : "locked");
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (passphrase: string) => {
    const res = await missionApiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ passphrase }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      return data.error ?? "Authentication failed";
    }
    setState("authenticated");
    return null;
  }, []);

  const logout = useCallback(async () => {
    await missionApiFetch("/auth/logout", { method: "POST" });
    setState("locked");
  }, []);

  const value = useMemo(
    () => ({ state, login, logout, refreshSession }),
    [state, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}

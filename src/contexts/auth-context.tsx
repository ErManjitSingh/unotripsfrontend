"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthResponse, AuthUser } from "@/lib/hotels-auth-api";
import { HotelsAuthError } from "@/lib/hotels-auth-api";
import {
  fetchAuthMe,
  guestSendOtp,
  guestVerifyOtp,
  loginUser,
  logoutUser,
  refreshAuthTokens,
  registerUser,
} from "@/lib/hotels-auth-api";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
  sessionFromAuthResponse,
  updateStoredAuthUser,
  type StoredAuthSession,
} from "@/lib/auth-session";
import { fetchAccountProfile } from "@/lib/hotels-account-api";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  sendGuestOtp: (phone: string) => Promise<string>;
  verifyGuestOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
  refreshUser: () => Promise<void>;
  updateUser: (user: AuthUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applyAuthResponse(
  response: AuthResponse,
  setUser: (u: AuthUser) => void,
  setSession: (s: StoredAuthSession) => void,
) {
  const stored = sessionFromAuthResponse(response.user, response.tokens);
  saveAuthSession(stored);
  setSession(stored);
  setUser(response.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    const stored = loadAuthSession();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    try {
      let { tokens } = stored;
      const { user: storedUser } = stored;
      const needsRefresh =
        tokens.refresh_token &&
        tokens.refresh_token !== tokens.access_token &&
        Date.now() >= stored.expiresAt - 60_000;

      if (needsRefresh) {
        try {
          tokens = await refreshAuthTokens(tokens.refresh_token);
          const refreshed = sessionFromAuthResponse(storedUser, tokens);
          saveAuthSession(refreshed);
          setSession(refreshed);
        } catch {
          setSession(stored);
        }
      } else {
        setSession(stored);
      }

      let me: AuthUser;
      try {
        me = await fetchAuthMe(tokens.access_token);
      } catch {
        me = await fetchAccountProfile(tokens.access_token);
      }
      setUser(me);
      const updated = sessionFromAuthResponse(me, tokens);
      saveAuthSession(updated);
      setSession(updated);
    } catch {
      clearAuthSession();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginUser(email.trim(), password);
    applyAuthResponse(response, setUser, setSession);
  }, []);

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; phone: string }) => {
      const response = await registerUser({
        ...payload,
        role: "guest",
      });
      applyAuthResponse(response, setUser, setSession);
    },
    [],
  );

  const sendGuestOtp = useCallback(async (phone: string) => {
    const data = await guestSendOtp(phone);
    return data.message ?? "OTP sent successfully.";
  }, []);

  const verifyGuestOtp = useCallback(async (phone: string, otp: string) => {
    const response = await guestVerifyOtp(phone, otp);
    applyAuthResponse(response, setUser, setSession);
  }, []);

  const logout = useCallback(async () => {
    const token = session?.tokens.access_token ?? loadAuthSession()?.tokens.access_token;
    if (token) {
      try {
        await logoutUser(token);
      } catch {
        /* clear locally even if API fails */
      }
    }
    clearAuthSession();
    setUser(null);
    setSession(null);
  }, [session]);

  const getAccessToken = useCallback(() => {
    return session?.tokens.access_token ?? loadAuthSession()?.tokens.access_token ?? null;
  }, [session]);

  const updateUser = useCallback((next: AuthUser) => {
    setUser(next);
    updateStoredAuthUser(next);
    setSession((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, user: next };
      saveAuthSession(updated);
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    const token = session?.tokens.access_token ?? loadAuthSession()?.tokens.access_token;
    if (!token) return;
    try {
      let me: AuthUser;
      try {
        me = await fetchAuthMe(token);
      } catch {
        me = await fetchAccountProfile(token);
      }
      updateUser(me);
    } catch {
      /* keep cached user */
    }
  }, [session, updateUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      sendGuestOtp,
      verifyGuestOtp,
      logout,
      getAccessToken,
      refreshUser,
      updateUser,
    }),
    [user, isLoading, login, register, sendGuestOtp, verifyGuestOtp, logout, getAccessToken, refreshUser, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useAuthOptional(): AuthContextValue | null {
  return useContext(AuthContext);
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof HotelsAuthError) {
    if (error.fieldErrors) {
      const parts = Object.entries(error.fieldErrors).map(([k, v]) =>
        k === "body" || k === "1" ? v : `${k}: ${v}`,
      );
      if (parts.length) return parts.join(" ");
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

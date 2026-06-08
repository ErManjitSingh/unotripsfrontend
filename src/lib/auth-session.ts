import type { AuthUser, AuthTokens } from "@/lib/hotels-auth-api";

const STORAGE_KEY = "uno_auth_session_v1";
export const AUTH_SESSION_COOKIE = "uno_auth_session";

export type StoredAuthSession = {
  user: AuthUser;
  tokens: AuthTokens;
  /** Unix ms when access token expires */
  expiresAt: number;
};

export function loadAuthSession(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAuthSession;
    if (!parsed?.user?.id || !parsed?.tokens?.access_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

function setSessionCookie(maxAgeSec: number) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${AUTH_SESSION_COOKIE}=1; path=/; max-age=${maxAgeSec}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

export function saveAuthSession(session: StoredAuthSession): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  setSessionCookie(Math.max(60, session.tokens.expires_in));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; max-age=0`;
}

export function sessionFromAuthResponse(
  user: AuthUser,
  tokens: AuthTokens,
): StoredAuthSession {
  return {
    user,
    tokens,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  };
}

export function getAccessToken(): string | null {
  return loadAuthSession()?.tokens.access_token ?? null;
}

export function updateStoredAuthUser(user: AuthUser): void {
  const session = loadAuthSession();
  if (!session) return;
  saveAuthSession({ ...session, user });
}

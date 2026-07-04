"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth-session";

export default function OAuth2CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = searchParams.toString();

    const token = getAccessToken();
    if (!token) {
      // Not logged in — redirect to login, come back here after
      router.replace("/login?redirect=" + encodeURIComponent("/oauth2/callback?" + params));
      return;
    }

    // Exchange our JWT for an OAuth2 auth code
    fetch("/api/oauth2/authorize?" + params, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        Accept: "application/json",
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("OAuth2 authorize failed:", res.status, text);
          router.replace("/login?error=sso_failed");
          return;
        }
        const data = await res.json();
        if (data.redirect_to) {
          window.location.assign(data.redirect_to);
        } else {
          router.replace("/login?error=sso_no_redirect");
        }
      })
      .catch((err) => {
        console.error("OAuth2 authorize error:", err);
        router.replace("/login?error=sso_error");
      });
  }, [searchParams, router]);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#fff",
      flexDirection: "column",
      gap: 16,
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#EA580C" strokeWidth="2" />
        <path d="M12 6v6l4 2" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p style={{ color: "#4B2B0A", fontFamily: "sans-serif", fontSize: 15 }}>
        Signing you in to UnoTrips Community…
      </p>
    </div>
  );
}

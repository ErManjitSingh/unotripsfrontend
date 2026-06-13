"use client";

import { useState, useEffect } from "react";
import { useToastState, ToastContext } from "@/lib/partner/toast";
import type { Toast, ToastType } from "@/lib/partner/toast";

const ICONS: Record<ToastType, string> = {
  success: "✓", error: "✕", info: "ℹ", warning: "⚠",
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: "#f0fdf4", border: "#bbf7d0", icon: "#16a34a" },
  error:   { bg: "#fef2f2", border: "#fecaca", icon: "#dc2626" },
  info:    { bg: "#f0f9ff", border: "#bae6fd", icon: "#0284c7" },
  warning: { bg: "#fffbeb", border: "#fde68a", icon: "#d97706" },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const c = COLORS[toast.type];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px",
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
      minWidth: 280, maxWidth: 380,
      animation: "slideIn 0.3s cubic-bezier(0.16,1,0.3,1)",
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: "50%",
        background: c.icon, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>
        {ICONS[toast.type]}
      </span>
      <span style={{ fontSize: 13, color: "#0A0A0A", flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button onClick={onDismiss} style={{
        color: "#9C9488", cursor: "pointer", fontSize: 16,
        lineHeight: 1, flexShrink: 0, background: "none", border: "none", padding: 0,
      }}>✕</button>
    </div>
  );
}

export default function ToastProvider({ children }: { children?: React.ReactNode }) {
  const state = useToastState();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <ToastContext.Provider value={state}>
      {children}
      {mounted && (
        <div style={{
          position: "fixed", top: 80, right: 20,
          zIndex: 9999,
          display: "flex", flexDirection: "column", gap: 8,
          pointerEvents: "none",
        }}>
          {state.toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: "auto" }}>
              <ToastItem toast={t} onDismiss={() => state.dismiss(t.id)} />
            </div>
          ))}
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(110%); opacity: 0; }
              to   { transform: translateX(0);    opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </ToastContext.Provider>
  );
}
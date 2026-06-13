"use client";

import { useState, useCallback, useContext, createContext, useRef } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 4000): string => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, type, message, duration }]);
    if (duration > 0) {
      const timer = setTimeout(() => {
        setToasts(t => t.filter(x => x.id !== id));
        timers.current.delete(id);
      }, duration);
      timers.current.set(id, timer);
    }
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  return { toasts, addToast, dismiss };
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return {
    success: (msg: string, duration?: number) => ctx.addToast(msg, "success", duration),
    error:   (msg: string, duration?: number) => ctx.addToast(msg, "error",   duration),
    info:    (msg: string, duration?: number) => ctx.addToast(msg, "info",    duration),
    warning: (msg: string, duration?: number) => ctx.addToast(msg, "warning", duration),
    dismiss: ctx.dismiss,
  };
}
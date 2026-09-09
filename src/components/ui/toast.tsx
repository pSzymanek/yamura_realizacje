"use client";

import React, { useEffect, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export function showToast(type: ToastType, message: string, duration = 5000) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("yamura-toast", {
      detail: {
        id: Math.random().toString(36).substring(2, 9),
        type,
        message,
        duration,
      },
    });
    window.dispatchEvent(event);
  }
}

// Skróty pomocnicze
export const toast = {
  success: (msg: string, duration = 5000) => showToast("success", msg, duration),
  error: (msg: string, duration = 6000) => showToast("error", msg, duration),
  info: (msg: string, duration = 4000) => showToast("info", msg, duration),
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    function handleCustomEvent(e: Event) {
      const customEvent = e as CustomEvent<ToastItem>;
      if (!customEvent.detail) return;
      const newToast = customEvent.detail;

      setToasts((prev) => [...prev, newToast]);

      const duration = newToast.duration ?? 5000;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(newToast.id);
        }, duration);
      }
    }

    window.addEventListener("yamura-toast", handleCustomEvent);
    return () => {
      window.removeEventListener("yamura-toast", handleCustomEvent);
    };
  }, [removeToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "min(440px, calc(100vw - 36px))",
        pointerEvents: "none",
      }}
    >
      {toasts.map((item) => {
        const isSuccess = item.type === "success";
        const isError = item.type === "error";

        const bg = isSuccess
          ? "linear-gradient(135deg, #0d2818 0%, #133822 100%)"
          : isError
          ? "linear-gradient(135deg, #2b0b0e 0%, #3d1217 100%)"
          : "linear-gradient(135deg, #18181b 0%, #27272a 100%)";

        const borderColor = isSuccess ? "#22c55e" : isError ? "#ef4444" : "#c5a77d";
        const glow = isSuccess
          ? "0 8px 24px rgba(34, 197, 94, 0.28), 0 2px 6px rgba(0,0,0,0.5)"
          : isError
          ? "0 8px 24px rgba(239, 68, 68, 0.32), 0 2px 6px rgba(0,0,0,0.5)"
          : "0 8px 24px rgba(0,0,0,0.4)";

        return (
          <div
            key={item.id}
            role="alert"
            style={{
              pointerEvents: "auto",
              background: bg,
              color: "#ffffff",
              border: `1.5px solid ${borderColor}`,
              borderRadius: "8px",
              padding: "14px 18px",
              boxShadow: glow,
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              animation: "yamuraToastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              position: "relative",
            }}
          >
            {/* Ikona */}
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: isSuccess ? "#22c55e" : isError ? "#ef4444" : "#c5a77d",
                color: isSuccess ? "#071c10" : "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "13px",
                flexShrink: 0,
                marginTop: "1px",
              }}
            >
              {isSuccess ? "✓" : isError ? "✕" : "ℹ"}
            </div>

            {/* Treść */}
            <div style={{ flex: 1, fontSize: "0.9rem", lineHeight: 1.45, fontWeight: 500 }}>
              <div
                style={{
                  fontSize: "0.76rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "2px",
                  color: isSuccess ? "#86efac" : isError ? "#fca5a5" : "#e5cfb3",
                }}
              >
                {isSuccess ? "Potwierdzenie" : isError ? "Wystąpił błąd" : "Informacja"}
              </div>
              <div style={{ color: "#f4f4f5", wordBreak: "break-word" }}>{item.message}</div>
            </div>

            {/* Przycisk zamknięcia */}
            <button
              type="button"
              onClick={() => removeToast(item.id)}
              aria-label="Zamknij powiadomienie"
              style={{
                background: "transparent",
                border: "none",
                color: "#a1a1aa",
                fontSize: "18px",
                lineHeight: "1",
                cursor: "pointer",
                padding: "2px 4px",
                margin: "-4px -6px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.15s ease",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#ffffff")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#a1a1aa")}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

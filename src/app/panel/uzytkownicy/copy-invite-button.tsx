"use client";

import { useState } from "react";

import { toast } from "@/components/ui/toast";

export function CopyInviteButton({
  token,
  appUrl,
  variant = "compact",
}: {
  token?: string;
  appUrl: string;
  variant?: "compact" | "full";
}) {
  const [copied, setCopied] = useState(false);

  if (!token) return null;

  const inviteUrl = `${appUrl}/rejestracja/${token}`;

  async function handleCopy() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const input = document.createElement("textarea");
        input.value = inviteUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      toast.success("Link aktywacyjny skopiowany do schowka!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Nie udało się skopiować linku do schowka.");
    }
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className="button button--secondary button--small"
        title="Skopiuj link aktywacyjny dla klienta"
        style={{
          fontSize: "0.75rem",
          padding: "4px 8px",
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          borderColor: copied ? "#2e7d32" : undefined,
          color: copied ? "#2e7d32" : undefined,
        }}
      >
        {copied ? "✓ Skopiowano link" : "🔗 Kopiuj link"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="button button--secondary"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        borderColor: copied ? "#2e7d32" : undefined,
        color: copied ? "#2e7d32" : undefined,
      }}
    >
      {copied ? "✓ Skopiowano link aktywacyjny!" : "🔗 Kopiuj link aktywacyjny"}
    </button>
  );
}

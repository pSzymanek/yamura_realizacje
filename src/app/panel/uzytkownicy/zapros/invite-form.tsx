"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { ProjectListItem } from "@/lib/types";
import { createInvitation } from "./actions";
import { toast } from "@/components/ui/toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button button--primary" type="submit" disabled={pending}>
      {pending ? "Generowanie..." : "Wygeneruj link zaproszenia"}
    </button>
  );
}

export function InviteForm({ unassignedProjects }: { unassignedProjects: ProjectListItem[] }) {
  const [error, setError] = useState("");
  const [successLink, setSuccessLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleProject = (id: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedProjectIds(unassignedProjects.map((p) => p.id));
  };

  const deselectAll = () => {
    setSelectedProjectIds([]);
  };

  const filteredProjects = unassignedProjects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.order_number.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(q))
    );
  });

  async function action(formData: FormData) {
    setError("");
    setSuccessLink("");
    setCopied(false);

    formData.set("projectIds", selectedProjectIds.join(","));

    const res = await createInvitation(formData);
    if (res.success && res.token) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      setSuccessLink(`${origin}/rejestracja/${res.token}`);
      toast.success("Zaproszenie dla klienta zostało wygenerowane!");
    } else {
      setError(res.error || "Wystąpił nieznany błąd.");
      toast.error(res.error || "Wystąpił błąd podczas generowania zaproszenia.");
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(successLink);
    setCopied(true);
    toast.success("Link aktywacyjny skopiowany do schowka!");
    setTimeout(() => setCopied(false), 3000);
  };

  if (successLink) {
    return (
      <div className="stack stack--large">
        <div className="form-message form-message--success">
          <strong>Gotowe! Zaproszenie utworzone.</strong>
          <span>Skopiuj poniższy link i wyślij go klientowi. Ważność linku wynosi 7 dni.</span>
        </div>
        <div className="private-link-card" style={{ padding: 0 }}>
          <code style={{ fontSize: "0.9rem", padding: "16px", marginBottom: "16px", userSelect: "all" }}>
            {successLink}
          </code>
          <button type="button" className="button button--secondary" onClick={handleCopy}>
            {copied ? "Skopiowano!" : "Skopiuj link"}
          </button>
        </div>
        <button type="button" className="button" style={{ background: "transparent", textDecoration: "underline", color: "var(--ink-soft)", padding: 0 }} onClick={() => setSuccessLink("")}>
          Utwórz kolejne zaproszenie
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="stack stack--large">
      {error && (
        <div className="form-message form-message--error">
          <strong>Błąd</strong>
          <span>{error}</span>
        </div>
      )}

      <div className="form-grid">
        <div className="field">
          <label htmlFor="email">E-mail (wymagany)</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="klient@email.com"
          />
        </div>
        <div className="field">
          <label htmlFor="fullName">Imię i nazwisko</label>
          <input id="fullName" name="fullName" type="text" placeholder="Jan Kowalski" />
        </div>
        <div className="field field--wide">
          <label htmlFor="phone">Telefon</label>
          <input id="phone" name="phone" type="tel" placeholder="+48 123 456 789" />
        </div>

        {unassignedProjects.length > 0 && (
          <div className="field field--wide">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
              <label style={{ margin: 0, fontWeight: 700, fontSize: "0.88rem" }}>
                Podepnij projekty do konta klienta
              </label>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>
                  Wybrano: <strong>{selectedProjectIds.length}</strong> z {unassignedProjects.length}
                </span>
                <button
                  type="button"
                  onClick={selectedProjectIds.length === unassignedProjects.length ? deselectAll : selectAll}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--accent-dark)",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  {selectedProjectIds.length === unassignedProjects.length ? "Odznacz wszystkie" : "Zaznacz wszystkie"}
                </button>
              </div>
            </div>

            {unassignedProjects.length > 4 && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtruj listę projektów (numer, nazwa)..."
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "0.82rem",
                  marginBottom: "8px",
                  background: "#fff",
                  border: "1px solid #ded6cc",
                }}
              />
            )}

            <div
              style={{
                maxHeight: "260px",
                overflowY: "auto",
                border: "1px solid #d8d0c7",
                background: "#faf8f5",
                padding: "6px 10px",
                borderRadius: "3px",
              }}
            >
              {filteredProjects.length === 0 ? (
                <p style={{ margin: "8px 0", fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                  Brak projektów pasujących do filtra.
                </p>
              ) : (
                filteredProjects.map((p) => {
                  const isChecked = selectedProjectIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "10px 8px",
                        borderBottom: "1px solid #eee8e0",
                        cursor: "pointer",
                        background: isChecked ? "#fff" : "transparent",
                        borderRadius: "2px",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProject(p.id)}
                        style={{ width: "17px", height: "17px", cursor: "pointer", accentColor: "#8b704f" }}
                      />
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.84rem",
                          color: isChecked ? "var(--ink)" : "#555",
                          minWidth: "120px",
                        }}
                      >
                        {p.order_number}
                      </span>
                      <span style={{ flex: 1, fontSize: "0.84rem", color: isChecked ? "var(--ink)" : "#666" }}>
                        {p.title}
                      </span>
                      {p.customer_name && (
                        <span style={{ fontSize: "0.76rem", color: "var(--ink-soft)" }}>
                          ({p.customer_name})
                        </span>
                      )}
                    </label>
                  );
                })
              )}
            </div>
            <small style={{ display: "block", marginTop: "6px", color: "var(--ink-soft)" }}>
              Zaznaczone projekty zostaną automatycznie powiązane z kontem klienta po jego rejestracji z linku.
            </small>
          </div>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: "12px" }}>
        <SubmitButton />
      </div>
    </form>
  );
}

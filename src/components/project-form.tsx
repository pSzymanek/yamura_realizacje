"use client";

import { useActionState, useState } from "react";

import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { createProjectAction } from "@/lib/actions";
import { INITIAL_ACTION_STATE } from "@/lib/types";

type CustomerOption = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
};

export function ProjectForm({ customers = [] }: { customers?: CustomerOption[] }) {
  const [state, action] = useActionState(createProjectAction, INITIAL_ACTION_STATE);
  const [isInternal, setIsInternal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!customerId) return;
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      setCustomerName(found.full_name || "");
      setCustomerEmail(found.email || "");
    }
  };

  return (
    <form action={action} className="card form-card stack stack--large">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="orderNumber">Numer projektu YMR</label>
          <input id="orderNumber" name="orderNumber" maxLength={80} placeholder="np. YMR/2026/120" required />
        </div>
        <div className="field">
          <label htmlFor="status">Początkowy status</label>
          <select id="status" name="status" defaultValue="inquiry" required>
            <optgroup label="Faza ofertowa / przygotowanie">
              <option value="inquiry">Zapytanie ofertowe</option>
              <option value="quote_preparing">Przygotowanie wyceny</option>
              <option value="quote_sent">Wycena wysłana do klienta</option>
              <option value="quote_accepted">Wycena zaakceptowana</option>
              <option value="contract">Umowa podpisana</option>
            </optgroup>
            <optgroup label="Faza realizacji stolarskiej">
              <option value="design">01. Projekt i Pomiary</option>
              <option value="materials">02. Materiały i Przygotowanie</option>
              <option value="production">03. Produkcja Stolarska</option>
              <option value="installation">04. Montaż u Klienta</option>
              <option value="completed">05. Realizacja Zakończona</option>
            </optgroup>
          </select>
        </div>
        <div className="field field--wide">
          <label htmlFor="title">Nazwa projektu</label>
          <input id="title" name="title" maxLength={160} placeholder="np. Kuchnia i zabudowa strefy dziennej" required />
        </div>

        <div className="field field--wide" style={{ padding: "12px 14px", background: "var(--surface-muted, #f8f8f8)", borderRadius: "8px", border: "1px solid var(--border-color, #eaeaea)" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600 }}>
            <input
              type="checkbox"
              name="isInternal"
              checked={isInternal}
              onChange={(e) => {
                setIsInternal(e.target.checked);
                if (e.target.checked) setSelectedCustomerId("");
              }}
            />
            <span>Realizacja wewnętrzna (tylko dla pracowni — bez klienta)</span>
          </label>
          <p style={{ margin: "4px 0 0 26px", fontSize: "0.85rem", color: "var(--muted, #666)" }}>
            Zaznacz, jeśli projekt jest realizowany na potrzeby własne, ekspozycji lub pochodzi ze źródła bez bezpośredniego kontaktu z klientem. Pola klienta staną się opcjonalne.
          </p>
        </div>

        {!isInternal && customers.length > 0 && (
          <div className="field field--wide" style={{ padding: "14px 16px", background: "#fbf9f5", border: "1px solid #e5ded4", borderRadius: "8px" }}>
            <label htmlFor="customerSelect" style={{ display: "block", marginBottom: "6px", fontWeight: 700, fontSize: "0.86rem", color: "var(--ink)" }}>
              👤 Przypisz do zarejestrowanego użytkownika <span style={{ fontWeight: "normal", color: "var(--ink-soft)" }}>(opcjonalnie)</span>
            </label>
            <select
              id="customerSelect"
              value={selectedCustomerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", background: "#fff", border: "1px solid #d8d0c7" }}
            >
              <option value="">— Wybierz istniejącego klienta lub wpisz dane poniżej —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
            <p style={{ margin: "6px 0 0", fontSize: "0.78rem", color: "var(--ink-soft)" }}>
              Wybranie klienta automatycznie uzupełni jego dane i podepnie realizację bezpośrednio pod jego konto w portalu.
            </p>
          </div>
        )}

        <input type="hidden" name="customerUserId" value={isInternal ? "" : selectedCustomerId} />

        <div className="field">
          <label htmlFor="customerName">
            Imię lub nazwa klienta {isInternal && <span style={{ fontWeight: "normal", color: "#888" }}>(opcjonalnie)</span>}
          </label>
          <input
            id="customerName"
            name="customerName"
            maxLength={160}
            required={!isInternal}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder={isInternal ? "Brak klienta (wewnętrzny)" : "np. Jan Kowalski"}
          />
        </div>
        <div className="field">
          <label htmlFor="customerEmail">
            Email klienta {isInternal && <span style={{ fontWeight: "normal", color: "#888" }}>(opcjonalnie)</span>}
          </label>
          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            maxLength={254}
            required={!isInternal}
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder={isInternal ? "opcjonalnie" : "klient@example.pl"}
          />
        </div>
      </div>
      <FormMessage state={state} />
      <div className="form-actions">
        <SubmitButton pendingText="Tworzenie projektu…">Utwórz projekt</SubmitButton>
      </div>
    </form>
  );
}

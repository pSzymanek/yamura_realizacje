"use client";

import { useState } from "react";

export function DemoNewProjectForm() {
  const [created, setCreated] = useState(false);
  const [isInternal, setIsInternal] = useState(false);

  return (
    <form
      className="card form-card stack stack--large"
      onSubmit={(event) => {
        event.preventDefault();
        setCreated(true);
      }}
    >
      <div className="form-grid">
        <div className="field">
          <label htmlFor="demoNumber">Numer projektu</label>
          <input id="demoNumber" defaultValue="YMR/2026/119" readOnly />
        </div>
        <div className="field">
          <label htmlFor="demoSource">Źródło</label>
          <select id="demoSource" defaultValue={isInternal ? "wewnetrzne" : "formularz"}>
            <option value="formularz">Formularz WWW</option>
            <option value="email">E-mail</option>
            <option value="telefon">Telefon</option>
            <option value="polecenie">Polecenie</option>
            <option value="wewnetrzne">Własne / showroom / wewnętrzne</option>
          </select>
        </div>
        <div className="field field--wide">
          <label htmlFor="demoTitle">Zakres projektu</label>
          <input id="demoTitle" placeholder="Np. kuchnia i zabudowa strefy dziennej" required />
        </div>

        <div
          className="field field--wide"
          style={{
            padding: "12px 14px",
            background: "var(--surface-muted, #f8f8f8)",
            borderRadius: "8px",
            border: "1px solid var(--border-color, #eaeaea)",
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontWeight: 600 }}>
            <input
              type="checkbox"
              name="demoInternal"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
            />
            <span>🔒 Realizacja wewnętrzna (tylko dla pracowni — bez klienta)</span>
          </label>
          <p style={{ margin: "4px 0 0 26px", fontSize: "0.85rem", color: "var(--muted, #666)" }}>
            Zaznacz, jeśli projekt jest realizowany na potrzeby własne, ekspozycji lub pochodzi ze źródła bez bezpośredniego kontaktu z klientem.
          </p>
        </div>

        <div className="field">
          <label htmlFor="demoCustomer">
            Klient {isInternal && <span style={{ fontWeight: "normal", color: "#888" }}>(opcjonalnie)</span>}
          </label>
          <input
            id="demoCustomer"
            placeholder={isInternal ? "Brak klienta (wewnętrzny)" : "Imię i nazwisko"}
            required={!isInternal}
          />
        </div>
        <div className="field">
          <label htmlFor="demoEmail">
            E-mail klienta {isInternal && <span style={{ fontWeight: "normal", color: "#888" }}>(opcjonalnie)</span>}
          </label>
          <input
            id="demoEmail"
            type="email"
            placeholder={isInternal ? "opcjonalnie" : "klient@example.pl"}
            required={!isInternal}
          />
        </div>
        <div className="field">
          <label htmlFor="demoPhone">Telefon</label>
          <input id="demoPhone" type="tel" placeholder="+48 000 000 000" />
        </div>
        <div className="field">
          <label htmlFor="demoOwner">Opiekun</label>
          <select id="demoOwner" defaultValue="piotr">
            <option value="piotr">Piotr Szymanek</option>
            <option value="michal">Michał Szwankowski</option>
            <option value="zaneta">Żaneta Jaworska</option>
            <option value="zespol">Zespół YAMURA</option>
          </select>
        </div>
        <div className="field field--wide">
          <label htmlFor="demoDescription">Opis i oczekiwania</label>
          <textarea
            id="demoDescription"
            rows={5}
            placeholder="Materiały, wymiary orientacyjne, preferowany termin…"
          />
        </div>
      </div>
      {created && (
        <div className="form-message form-message--success" role="status">
          Projekt YMR/2026/119 {isInternal ? "(wewnętrzny pracowni)" : ""} został utworzony w podglądzie demonstracyjnym.
        </div>
      )}
      <div className="form-actions">
        <button className="button button--primary" type="submit">
          Utwórz projekt demonstracyjny
        </button>
      </div>
    </form>
  );
}

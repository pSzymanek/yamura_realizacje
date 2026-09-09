"use client";

import { useState } from "react";

export function ConsultationBooking() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [project, setProject] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
    }, 400);
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <section className="customer-surface" style={{ padding: "clamp(24px, 4vw, 36px)" }}>
        {/* Prominent explanation banner */}
        <div
          style={{
            background: "#faf7f2",
            border: "1px solid #ded6cc",
            borderLeft: "3.5px solid #287a4c",
            padding: "16px 20px",
            marginBottom: "28px",
            borderRadius: "2px",
          }}
        >
          <strong
            style={{
              display: "block",
              color: "#171717",
              fontSize: "0.95rem",
              marginBottom: "4px",
              fontWeight: 700,
            }}
          >
            Zostaw kontakt — termin ustalimy wspólnie
          </strong>
          <p style={{ margin: 0, color: "#6e665d", fontSize: "0.86rem", lineHeight: 1.55 }}>
            Wystarczy, że podasz poniżej swoje dane. Nasz zespół skontaktuje się z Tobą telefonicznie lub mailowo, aby wspólnie dobrać najbardziej dogodny dzień i godzinę rozmowy o Twoim projekcie.
          </p>
        </div>

        {isSubmitted ? (
          <div
            className="customer-demo-success"
            role="status"
            style={{
              padding: "24px 22px",
              border: "1px solid #287a4c",
              background: "#f0f7f3",
              color: "#1b5e37",
              borderRadius: "2px",
              textAlign: "center",
            }}
          >
            <strong style={{ display: "block", fontSize: "1.15rem", marginBottom: "8px", color: "#1b5e37" }}>
              ✓ Zgłoszenie zostało pomyślnie wysłane
            </strong>
            <p style={{ margin: "0 0 16px", fontSize: "0.9rem", color: "#287a4c", lineHeight: 1.6 }}>
              Dziękujemy za kontakt! Otrzymaliśmy Twoje dane ({fullName}, tel. {phone}). Odezwiemy się wkrótce, aby wspólnie ustalić dogodny termin rozmowy.
            </p>
            <button
              type="button"
              className="customer-button"
              onClick={() => {
                setIsSubmitted(false);
                setNotes("");
              }}
              style={{
                display: "inline-block",
                padding: "8px 18px",
                fontSize: "0.8rem",
                background: "#fff",
                border: "1px solid #287a4c",
                color: "#1b5e37",
                cursor: "pointer",
              }}
            >
              Wyślij inne zgłoszenie
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: "20px" }}>
              <div>
                <label
                  htmlFor="booking-name"
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#3d362e",
                    marginBottom: "6px",
                    letterSpacing: "0.02em",
                  }}
                >
                  Imię i nazwisko <span style={{ color: "#c5a77d" }}>*</span>
                </label>
                <input
                  id="booking-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="np. Anna Kowalska"
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1px solid #ded6cc",
                    borderRadius: "2px",
                    background: "#fff",
                    fontSize: "0.92rem",
                    color: "#171717",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
                <div>
                  <label
                    htmlFor="booking-phone"
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "#3d362e",
                      marginBottom: "6px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Numer telefonu do kontaktu <span style={{ color: "#c5a77d" }}>*</span>
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="np. +48 600 123 456"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #ded6cc",
                      borderRadius: "2px",
                      background: "#fff",
                      fontSize: "0.92rem",
                      color: "#171717",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    style={{
                      display: "block",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "#3d362e",
                      marginBottom: "6px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Adres e-mail <span style={{ color: "#c5a77d" }}>*</span>
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="np. anna.kowalska@example.pl"
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      border: "1px solid #ded6cc",
                      borderRadius: "2px",
                      background: "#fff",
                      fontSize: "0.92rem",
                      color: "#171717",
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="booking-project"
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#3d362e",
                    marginBottom: "6px",
                    letterSpacing: "0.02em",
                  }}
                >
                  Dotyczy projektu lub tematu rozmowy
                </label>
                <select
                  id="booking-project"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1px solid #ded6cc",
                    borderRadius: "2px",
                    background: "#fff",
                    fontSize: "0.9rem",
                    color: "#171717",
                  }}
                >
                  <option>YMR/2026/084 · Kuchnia i zabudowa strefy dziennej</option>
                  <option>YMR/2026/118 · Zabudowa RTV i biblioteka salonu</option>
                  <option>Nowe zapytanie ofertowe (jeszcze bez numeru)</option>
                  <option>Inny temat lub konsultacja ogólna</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="booking-notes"
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#3d362e",
                    marginBottom: "6px",
                    letterSpacing: "0.02em",
                  }}
                >
                  Krótki opis lub uwagi (opcjonalnie)
                </label>
                <textarea
                  id="booking-notes"
                  rows={4}
                  placeholder="Napisz krótko, o czym chciałbyś porozmawiać lub jakie kwestie omówić..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    border: "1px solid #ded6cc",
                    borderRadius: "2px",
                    background: "#fff",
                    fontSize: "0.88rem",
                    fontFamily: "inherit",
                    color: "#171717",
                    resize: "vertical",
                    lineHeight: 1.5,
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="customer-button customer-button--dark"
                style={{
                  width: "100%",
                  padding: "15px 24px",
                  fontSize: "0.92rem",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  cursor: isSending ? "not-allowed" : "pointer",
                  marginTop: "8px",
                }}
              >
                {isSending ? "Wysyłanie zgłoszenia..." : "Wyślij zgłoszenie konsultacji →"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

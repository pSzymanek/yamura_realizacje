"use client";

import { useState } from "react";
import { DemoAdminCustomer } from "@/lib/types";
import { updateCustomerAction, deleteCustomerAction, regenerateInvitationAction } from "./actions";
import { CopyInviteButton } from "./copy-invite-button";
import { formatDate } from "@/lib/format";

export type SimpleProject = {
  id: string;
  order_number: string;
  title: string;
  customer_name?: string | null;
};

export function EditCustomerModal({
  customer,
  allProjects,
  appUrl,
  onClose,
}: {
  customer: DemoAdminCustomer;
  allProjects: SimpleProject[];
  appUrl: string;
  onClose: () => void;
}) {
  const [fullName, setFullName] = useState(customer.full_name || "");
  const [email, setEmail] = useState(customer.email || "");
  const [phone, setPhone] = useState(customer.phone !== "—" ? customer.phone : "");
  const [addressLine1, setAddressLine1] = useState(customer.address_line1 || "");
  const [addressLine2, setAddressLine2] = useState(customer.address_line2 || "");
  const [postalCode, setPostalCode] = useState(customer.postal_code || "");
  const [city, setCity] = useState(customer.city !== "—" ? customer.city : "");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(customer.project_ids || []);
  const [projectSearch, setProjectSearch] = useState("");

  const [invitationToken, setInvitationToken] = useState(customer.invitation_token || "");
  const [invitationExpiresAt, setInvitationExpiresAt] = useState(customer.invitation_expires_at || "");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isInvited = customer.status === "invited" || Boolean(invitationToken);
  const isExpired = invitationExpiresAt ? new Date(invitationExpiresAt) < new Date() : false;

  function toggleProject(projectId: string) {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !email.includes("@")) {
      setError("Podaj poprawny adres e-mail.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError("Nowe hasło musi mieć co najmniej 8 znaków.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateCustomerAction({
        id: customer.id,
        status: customer.status,
        fullName,
        email,
        phone,
        address_line1: addressLine1,
        address_line2: addressLine2,
        postal_code: postalCode,
        city,
        newPassword: newPassword || undefined,
        projectIds: selectedProjectIds,
      });

      if (res.success) {
        setSuccess("Zmiany zostały pomyślnie zapisane!");
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || "Wystąpił błąd podczas zapisu.");
      }
    } catch (err: any) {
      setError(err.message || "Błąd zapisu danych.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setError("");
    setIsDeleting(true);
    try {
      const res = await deleteCustomerAction(customer.id, customer.status, customer.email);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || "Nie udało się usunąć użytkownika.");
        setShowDeleteConfirm(false);
      }
    } catch (err: any) {
      setError(err.message || "Błąd podczas usuwania.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleRegenerateInvite() {
    setIsRegenerating(true);
    setError("");
    try {
      const res = await regenerateInvitationAction(customer.id);
      if (res.success && res.token) {
        setInvitationToken(res.token);
        if (res.expires_at) setInvitationExpiresAt(res.expires_at);
        setSuccess("Wygenerowano nowy link zaproszenia! Ważność przedłużona o 7 dni.");
      } else {
        setError(res.error || "Błąd podczas generowania nowego linku.");
      }
    } catch (err: any) {
      setError(err.message || "Błąd podczas odświeżania linku.");
    } finally {
      setIsRegenerating(false);
    }
  }

  const filteredProjects = allProjects.filter((p) => {
    const q = projectSearch.toLowerCase();
    return (
      p.order_number.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(q))
    );
  });

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(18, 16, 14, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card form-card"
        style={{
          width: "min(100%, 680px)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          overflow: "hidden",
          borderRadius: "14px",
          backgroundColor: "var(--white, #ffffff)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--line, #e2ded8)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--paper, #f7f5f2)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.68rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "var(--accent-dark, #8b704f)",
                fontWeight: 700,
              }}
            >
              Zarządzanie kontem
            </span>
            <h2 style={{ fontSize: "1.4rem", margin: "2px 0 0", color: "var(--ink, #1f1e1d)" }}>
              Edycja użytkownika: {customer.full_name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--bark, #6b635b)",
              lineHeight: 1,
              padding: "4px 8px",
            }}
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {error && (
            <div className="form-message form-message--error" style={{ marginBottom: "18px" }}>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 16px",
                background: "#e8f5e9",
                color: "#2e7d32",
                borderRadius: "8px",
                fontSize: "0.88rem",
                fontWeight: 600,
              }}
            >
              ✓ {success}
            </div>
          )}

          {/* Activation Link Card (if invited or unactivated) */}
          {isInvited && invitationToken && (
            <div
              style={{
                padding: "16px 18px",
                backgroundColor: isExpired ? "#fff8f7" : "#fbf9f5",
                border: isExpired ? "1px solid #e08b8b" : "1px solid #d4c5b3",
                borderRadius: "10px",
                marginBottom: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: isExpired ? "#b71c1c" : "#8b704f" }}>
                  {isExpired ? "⚠️ Link aktywacyjny wygasł" : "🔗 Dedykowany link aktywacyjny dla klienta"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--bark, #6b635b)" }}>
                  {invitationExpiresAt ? `Ważny do: ${formatDate(invitationExpiresAt)}` : ""}
                </span>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--bark, #6b635b)", margin: "0 0 10px 0" }}>
                Konto klienta oczekuje na dokończenie rejestracji. Prześlij klientowi poniższy link, aby mógł ustalić własne hasło i zalogować się do strefy klienta.
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input
                  type="text"
                  readOnly
                  value={`${appUrl}/rejestracja/${invitationToken}`}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  style={{
                    flex: "1 1 260px",
                    background: "#ffffff",
                    fontSize: "0.8rem",
                    padding: "8px 12px",
                    border: "1px solid var(--line, #ddd)",
                    borderRadius: "6px",
                  }}
                />
                <CopyInviteButton token={invitationToken} appUrl={appUrl} variant="full" />
                <button
                  type="button"
                  onClick={handleRegenerateInvite}
                  disabled={isRegenerating}
                  className="button button--secondary button--small"
                  style={{ fontSize: "0.78rem" }}
                >
                  {isRegenerating ? "Odświeżanie..." : "Przedłuż o 7 dni"}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSave} id="edit-customer-form" className="stack stack--large">
            {/* Dane osobowe */}
            <div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "12px", color: "var(--ink, #1f1e1d)" }}>
                Dane osobowe i kontaktowe
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                <div className="field">
                  <label htmlFor="edit-fullName">Imię i nazwisko</label>
                  <input
                    id="edit-fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-email">Adres e-mail (login)</label>
                  <input
                    id="edit-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginTop: "14px" }}>
                <div className="field">
                  <label htmlFor="edit-phone">Numer telefonu</label>
                  <input
                    id="edit-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+48 000 000 000"
                  />
                </div>
              </div>
            </div>

            {/* Adres */}
            <div>
              <h3 style={{ fontSize: "1.05rem", marginBottom: "12px", color: "var(--ink, #1f1e1d)" }}>
                Adres inwestycji / klienta
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
                <div className="field">
                  <label htmlFor="edit-address1">Ulica i numer</label>
                  <input
                    id="edit-address1"
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="np. ul. Lipowa 12"
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-address2">Lokal / piętro</label>
                  <input
                    id="edit-address2"
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="np. m. 4"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "14px", marginTop: "14px" }}>
                <div className="field">
                  <label htmlFor="edit-postalCode">Kod pocztowy</label>
                  <input
                    id="edit-postalCode"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="00-000"
                  />
                </div>
                <div className="field">
                  <label htmlFor="edit-city">Miejscowość</label>
                  <input
                    id="edit-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="np. Warszawa"
                  />
                </div>
              </div>
            </div>

            {/* Hasło */}
            <div
              style={{
                padding: "16px",
                border: "1px solid var(--line, #e2ded8)",
                borderRadius: "10px",
                background: "var(--paper, #f7f5f2)",
              }}
            >
              <h3 style={{ fontSize: "1.05rem", marginBottom: "6px", color: "var(--ink, #1f1e1d)" }}>
                Reset / Ustawienie hasła
              </h3>
              <p style={{ fontSize: "0.82rem", color: "var(--bark, #6b635b)", margin: "0 0 12px 0" }}>
                Pozostaw puste, jeśli nie chcesz zmieniać hasła klienta. Wpisz nowe hasło (min. 8 znaków), aby zresetować hasło natychmiastowo.
              </p>
              <div className="field">
                <label htmlFor="edit-password">Nowe hasło dla klienta</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    id="edit-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Wpisz nowe hasło (min. 8 znaków)…"
                    minLength={8}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="button button--secondary button--small"
                    style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                  >
                    {showPassword ? "Ukryj" : "Pokaż"}
                  </button>
                </div>
              </div>
            </div>

            {/* Przypisane projekty */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <h3 style={{ fontSize: "1.05rem", margin: 0, color: "var(--ink, #1f1e1d)" }}>
                  Przypisane realizacje w stolarni ({selectedProjectIds.length})
                </h3>
                <span style={{ fontSize: "0.78rem", color: "var(--bark, #6b635b)" }}>
                  Zaznacz realizacje, do których ten klient ma dostęp
                </span>
              </div>

              <div style={{ marginBottom: "10px" }}>
                <input
                  type="search"
                  placeholder="Filtruj realizacje po nazwie, numerze lub kliencie…"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  style={{ width: "100%", fontSize: "0.82rem", padding: "6px 10px" }}
                />
              </div>

              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  border: "1px solid var(--line, #e2ded8)",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  background: "#ffffff",
                }}
              >
                {filteredProjects.length === 0 ? (
                  <p style={{ fontSize: "0.84rem", color: "var(--bark)", padding: "8px 0" }}>
                    Brak realizacji spełniających kryteria.
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
                          gap: "10px",
                          padding: "7px 0",
                          borderBottom: "1px solid #f0ede9",
                          cursor: "pointer",
                          fontSize: "0.84rem",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleProject(p.id)}
                          style={{ width: "16px", height: "16px" }}
                        />
                        <span style={{ fontWeight: 700, minWidth: "85px" }}>{p.order_number}</span>
                        <span style={{ flex: 1 }}>{p.title}</span>
                        {p.customer_name && (
                          <span style={{ color: "var(--bark)", fontSize: "0.76rem" }}>
                            ({p.customer_name})
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </form>

          {/* Delete Confirmation Box */}
          {showDeleteConfirm && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                border: "1px solid #e57373",
                borderRadius: "10px",
                background: "#ffebee",
              }}
            >
              <h4 style={{ color: "#c62828", margin: "0 0 6px 0", fontSize: "0.95rem" }}>
                ⚠️ Potwierdź całkowite usunięcie użytkownika
              </h4>
              <p style={{ fontSize: "0.82rem", color: "#491010", margin: "0 0 12px 0" }}>
                Czy na pewno chcesz usunąć konto klienta <strong>{customer.full_name}</strong> ({customer.email})?
                Wszystkie powiązane realizacje pozostaną nienaruszone w systemie stolarni, ale zostaną odłączone od tego konta. Tej operacji nie można cofnąć.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="button button--danger"
                  style={{
                    background: "#c62828",
                    color: "#ffffff",
                    borderColor: "#c62828",
                    fontSize: "0.84rem",
                  }}
                >
                  {isDeleting ? "Usuwanie..." : "Tak, usuń tego użytkownika"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="button button--secondary"
                  style={{ fontSize: "0.84rem" }}
                >
                  Anuluj
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--line, #e2ded8)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--paper, #f7f5f2)",
          }}
        >
          <div>
            {!showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                style={{
                  background: "transparent",
                  color: "#d32f2f",
                  border: "1px solid #d32f2f",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Usuń użytkownika
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              className="button button--secondary"
            >
              Anuluj
            </button>
            <button
              type="submit"
              form="edit-customer-form"
              disabled={isSaving}
              className="button button--primary"
            >
              {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

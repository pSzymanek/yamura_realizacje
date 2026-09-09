"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DemoAdminCustomer } from "@/lib/types";
import {
  updateCustomerAction,
  deleteCustomerAction,
  regenerateInvitationAction,
} from "../actions";
import { CopyInviteButton } from "../copy-invite-button";
import { formatDate } from "@/lib/format";
import { toast } from "@/components/ui/toast";

export type SimpleProject = {
  id: string;
  order_number: string;
  title: string;
  customer_name?: string | null;
};

const statusLabels: Record<string, string> = {
  active: "Aktywne",
  invited: "Zaproszone (oczekuje na aktywację)",
  inactive: "Nieaktywne",
};

export function EditCustomerForm({
  customer,
  allProjects,
  appUrl,
}: {
  customer: DemoAdminCustomer;
  allProjects: SimpleProject[];
  appUrl: string;
}) {
  const router = useRouter();
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

  function selectAllProjects() {
    setSelectedProjectIds(allProjects.map((p) => p.id));
  }

  function deselectAllProjects() {
    setSelectedProjectIds([]);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !email.includes("@")) {
      setError("Podaj poprawny adres e-mail.");
      toast.error("Podaj poprawny adres e-mail.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError("Nowe hasło musi mieć co najmniej 8 znaków.");
      toast.error("Nowe hasło musi mieć co najmniej 8 znaków.");
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
        toast.success("Zmiany zostały pomyślnie zapisane!");
        router.refresh();
        setTimeout(() => {
          router.push("/panel/uzytkownicy");
        }, 1200);
      } else {
        setError(res.error || "Wystąpił błąd podczas zapisu.");
        toast.error(res.error || "Wystąpił błąd podczas zapisu.");
      }
    } catch (err: any) {
      setError(err.message || "Błąd zapisu danych.");
      toast.error(err.message || "Błąd zapisu danych.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError("");
    try {
      const res = await deleteCustomerAction(customer.id, customer.status, email);
      if (res.success) {
        toast.success("Użytkownik został pomyślnie usunięty.");
        router.push("/panel/uzytkownicy");
        router.refresh();
      } else {
        setError(res.error || "Błąd usuwania użytkownika.");
        toast.error(res.error || "Błąd usuwania użytkownika.");
        setIsDeleting(false);
      }
    } catch (err: any) {
      setError(err.message || "Błąd usuwania.");
      toast.error(err.message || "Błąd usuwania.");
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
        setSuccess("Wygenerowano nowy link aktywacyjny!");
        toast.success("Wygenerowano nowy link aktywacyjny!");
      } else {
        setError(res.error || "Błąd generowania linku.");
        toast.error(res.error || "Błąd generowania linku.");
      }
    } catch (err: any) {
      setError(err.message || "Błąd generowania linku.");
      toast.error(err.message || "Błąd generowania linku.");
    } finally {
      setIsRegenerating(false);
    }
  }

  const filteredProjects = allProjects.filter((p) => {
    if (!projectSearch) return true;
    const q = projectSearch.toLowerCase();
    return (
      p.order_number.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      (p.customer_name && p.customer_name.toLowerCase().includes(q))
    );
  });

  return (
    <form onSubmit={handleSave} className="stack stack--large" style={{ maxWidth: "860px" }}>
      {error && (
        <div className="form-message form-message--error">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "14px 18px",
            background: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "6px",
            fontSize: "0.92rem",
            fontWeight: 600,
            border: "1px solid #c8e6c9",
          }}
        >
          ✓ {success}
        </div>
      )}

      {/* Info status header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 20px",
          background: "#faf8f5",
          border: "1px solid var(--line)",
          borderRadius: "6px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <span style={{ fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-soft)" }}>
            Status konta
          </span>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--ink)" }}>
            {statusLabels[customer.status] || customer.status}
          </div>
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--ink-soft)", textAlign: "right" }}>
          {customer.registered_at && (
            <div>Utworzono: <strong>{formatDate(customer.registered_at)}</strong></div>
          )}
          {customer.last_active && <div>Aktywność: {customer.last_active}</div>}
        </div>
      </div>

      {/* Activation Link Card (if invited or unactivated) */}
      {isInvited && invitationToken && (
        <div
          style={{
            padding: "20px 22px",
            backgroundColor: isExpired ? "#fff8f7" : "#fbf9f5",
            border: isExpired ? "1px solid #e08b8b" : "1px solid #d4c5b3",
            borderRadius: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: isExpired ? "#b71c1c" : "#8b704f" }}>
              {isExpired ? "⚠️ Link aktywacyjny wygasł" : "🔗 Dedykowany link aktywacyjny dla klienta"}
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>
              {invitationExpiresAt ? `Ważny do: ${formatDate(invitationExpiresAt)}` : ""}
            </span>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0 0 12px 0" }}>
            Konto klienta oczekuje na dokończenie rejestracji. Prześlij klientowi poniższy link, aby mógł ustalić własne hasło i zalogować się do strefy klienta.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              type="text"
              readOnly
              value={`${appUrl}/rejestracja/${invitationToken}`}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              style={{
                flex: "1 1 300px",
                background: "#ffffff",
                fontSize: "0.86rem",
                padding: "10px 14px",
                border: "1px solid var(--line)",
                borderRadius: "4px",
              }}
            />
            <CopyInviteButton token={invitationToken} appUrl={appUrl} />
            <button
              type="button"
              className="button button--secondary"
              onClick={handleRegenerateInvite}
              disabled={isRegenerating}
              style={{ fontSize: "0.82rem" }}
            >
              {isRegenerating ? "Generowanie..." : "Wygeneruj nowy link (odnów)"}
            </button>
          </div>
        </div>
      )}

      {/* Section 1: Contact Details */}
      <div className="card form-card stack">
        <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}>Dane kontaktowe</h3>
        <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "var(--ink-soft)" }}>
          Podstawowe dane identyfikacyjne klienta widoczne w korespondencji i dokumentach.
        </p>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="fullName">Imię i nazwisko</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="np. Piotr Szymanek"
            />
          </div>
          <div className="field">
            <label htmlFor="email">Adres e-mail (login)</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="np. klient@email.com"
            />
          </div>
          <div className="field field--wide">
            <label htmlFor="phone">Numer telefonu</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="np. +48 123 456 789"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Address */}
      <div className="card form-card stack">
        <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}>Adres korespondencyjny / montażowy</h3>
        <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "var(--ink-soft)" }}>
          Adres wykorzystywany przy montażu stolarki i umowach.
        </p>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="addressLine1">Ulica i numer budynku</label>
            <input
              id="addressLine1"
              type="text"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="np. ul. Lipowa 12"
            />
          </div>
          <div className="field">
            <label htmlFor="addressLine2">Numer lokalu / piętro</label>
            <input
              id="addressLine2"
              type="text"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="np. m. 4"
            />
          </div>
          <div className="field">
            <label htmlFor="postalCode">Kod pocztowy</label>
            <input
              id="postalCode"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="00-000"
            />
          </div>
          <div className="field">
            <label htmlFor="city">Miejscowość</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="np. Warszawa"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Password / Security */}
      <div className="card form-card stack">
        <h3 style={{ margin: "0 0 4px", fontSize: "1.05rem" }}>Reset / Ustawienie hasła</h3>
        <p style={{ margin: "0 0 16px", fontSize: "0.82rem", color: "var(--ink-soft)" }}>
          Pozostaw puste, jeśli nie chcesz zmieniać hasła klienta. Wpisz nowe hasło (min. 8 znaków), aby zresetować hasło natychmiastowo.
        </p>

        <div className="field field--wide">
          <label htmlFor="newPassword">Nowe hasło dla klienta</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Wpisz nowe hasło (min. 8 znaków)..."
              minLength={8}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setShowPassword(!showPassword)}
              style={{ padding: "0 16px", fontSize: "0.8rem" }}
            >
              {showPassword ? "Ukryj" : "Pokaż"}
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Assigned Projects */}
      <div className="card form-card stack">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.05rem" }}>
              Przypisane realizacje w stolarni ({selectedProjectIds.length})
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--ink-soft)" }}>
              Zaznacz realizacje, do których ten klient ma mieć pełny dostęp w swoim panelu.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              type="button"
              onClick={selectAllProjects}
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
              Zaznacz wszystkie
            </button>
            <span style={{ color: "var(--line)" }}>|</span>
            <button
              type="button"
              onClick={deselectAllProjects}
              style={{
                background: "none",
                border: "none",
                color: "var(--ink-soft)",
                fontSize: "0.78rem",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Odznacz wszystkie
            </button>
          </div>
        </div>

        {allProjects.length > 4 && (
          <input
            type="text"
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            placeholder="Filtruj realizacje po nazwie, numerze lub kliencie..."
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "0.82rem",
              background: "#fff",
              border: "1px solid var(--line)",
              marginBottom: "8px",
            }}
          />
        )}

        <div
          style={{
            maxHeight: "320px",
            overflowY: "auto",
            border: "1px solid var(--line)",
            background: "#faf8f5",
            padding: "8px 12px",
            borderRadius: "4px",
          }}
        >
          {filteredProjects.length === 0 ? (
            <p style={{ fontSize: "0.84rem", color: "var(--ink-soft)", padding: "12px 0", margin: 0 }}>
              Brak realizacji spełniających kryteria wyszukiwania.
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
                    borderBottom: "1px solid #ede8e0",
                    cursor: "pointer",
                    fontSize: "0.84rem",
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
                  <span style={{ fontWeight: 700, minWidth: "115px", color: isChecked ? "var(--ink)" : "#555" }}>
                    {p.order_number}
                  </span>
                  <span style={{ flex: 1, color: isChecked ? "var(--ink)" : "#666" }}>
                    {p.title}
                  </span>
                  {p.customer_name && (
                    <span style={{ color: "var(--ink-soft)", fontSize: "0.78rem" }}>
                      ({p.customer_name})
                    </span>
                  )}
                </label>
              );
            })
          )}
        </div>
      </div>

      {/* Section 5: Danger Zone (Delete Customer) */}
      <div
        style={{
          border: "1px solid #f2c0c0",
          borderRadius: "8px",
          padding: "18px 22px",
          background: "#fffaf9",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <strong style={{ color: "#c62828", fontSize: "0.92rem", display: "block" }}>
              Strefa niebezpieczna: Usunięcie użytkownika
            </strong>
            <span style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>
              Całkowite usunięcie profilu klienta i zaproszenia. Realizacje w bazie pozostaną nienaruszone.
            </span>
          </div>
          {!showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: "8px 16px",
                border: "1px solid #e57373",
                background: "transparent",
                color: "#c62828",
                borderRadius: "4px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Usuń konto klienta
            </button>
          )}
        </div>

        {showDeleteConfirm && (
          <div
            style={{
              marginTop: "16px",
              padding: "16px",
              border: "1px solid #e57373",
              borderRadius: "6px",
              background: "#ffebee",
            }}
          >
            <h4 style={{ color: "#c62828", margin: "0 0 6px 0", fontSize: "0.92rem" }}>
              ⚠️ Czy na pewno chcesz trwale usunąć konto: {customer.full_name}?
            </h4>
            <p style={{ fontSize: "0.82rem", color: "#491010", margin: "0 0 14px 0" }}>
              Tej operacji nie można cofnąć. Klient straci natychmiast dostęp do panelu Yamura. Realizacje i historia prac w warsztacie zostaną odpięte, ale nie ulegną skasowaniu.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: "9px 18px",
                  background: "#c62828",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: 700,
                  fontSize: "0.84rem",
                  cursor: "pointer",
                }}
              >
                {isDeleting ? "Usuwanie..." : "Tak, usuń trwale"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="button button--secondary"
                style={{ fontSize: "0.84rem", padding: "9px 18px" }}
              >
                Anuluj
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Action Buttons */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
        <button
          type="submit"
          className="button button--primary"
          disabled={isSaving}
          style={{ minWidth: "160px", padding: "12px 24px" }}
        >
          {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
        </button>
        <Link
          href="/panel/uzytkownicy"
          className="button button--secondary"
          style={{ padding: "12px 20px" }}
        >
          Wróć do listy
        </Link>
      </div>
    </form>
  );
}

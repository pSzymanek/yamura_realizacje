"use client";

import { useActionState, useState } from "react";

import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import {
  updateCustomerProfileAction,
  changeCustomerPasswordAction,
  deleteCustomerAccountAction,
} from "@/lib/actions";
import type { CustomerProfile } from "@/lib/types";
import { INITIAL_ACTION_STATE } from "@/lib/types";

export function CustomerProfileForm({ profile, email }: { profile: CustomerProfile; email: string }) {
  const [profileState, profileAction] = useActionState(updateCustomerProfileAction, INITIAL_ACTION_STATE);
  const [passwordState, passwordAction] = useActionState(changeCustomerPasswordAction, INITIAL_ACTION_STATE);
  const [deleteState, deleteAction] = useActionState(deleteCustomerAccountAction, INITIAL_ACTION_STATE);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="customer-profile-layout">
      <div className="stack stack--large">
        {/* Dane kontaktowe */}
        <form action={profileAction} className="customer-surface customer-profile-form">
          <div className="customer-section-title">
            <div>
              <span className="customer-eyebrow">Dane podstawowe</span>
              <h2>Dane kontaktowe</h2>
            </div>
          </div>
          <div className="customer-form-grid">
            <label>
              <span>Imię i nazwisko</span>
              <input name="fullName" defaultValue={profile.full_name || ""} required maxLength={120} />
            </label>
            <label>
              <span>Adres e-mail</span>
              <input value={email} disabled />
              <small>Adres e-mail jest identyfikatorem konta.</small>
            </label>
            <label>
              <span>Telefon</span>
              <input name="phone" type="tel" defaultValue={profile.phone || ""} maxLength={40} />
            </label>
            <label className="customer-field-wide">
              <span>Ulica i numer</span>
              <input name="addressLine1" defaultValue={profile.address_line1 || ""} maxLength={180} />
            </label>
            <label className="customer-field-wide">
              <span>Adres — ciąg dalszy</span>
              <input name="addressLine2" defaultValue={profile.address_line2 || ""} maxLength={180} placeholder="Opcjonalnie: lokal, piętro" />
            </label>
            <label>
              <span>Kod pocztowy</span>
              <input name="postalCode" defaultValue={profile.postal_code || ""} maxLength={20} />
            </label>
            <label>
              <span>Miejscowość</span>
              <input name="city" defaultValue={profile.city || ""} maxLength={100} />
            </label>
          </div>
          <FormMessage state={profileState} />
          <SubmitButton pendingText="Zapisywanie…">Zapisz dane</SubmitButton>
        </form>

        {/* Zmiana hasła */}
        <form action={passwordAction} className="customer-surface customer-profile-form">
          <div className="customer-section-title">
            <div>
              <span className="customer-eyebrow">Bezpieczeństwo</span>
              <h2>Zmień hasło</h2>
            </div>
          </div>
          <div className="customer-form-grid">
            <label>
              <span>Nowe hasło</span>
              <input name="password" type="password" required minLength={8} placeholder="Min. 8 znaków" />
            </label>
            <label>
              <span>Powtórz nowe hasło</span>
              <input name="passwordConfirm" type="password" required minLength={8} placeholder="Powtórz hasło" />
            </label>
          </div>
          <FormMessage state={passwordState} />
          <SubmitButton pendingText="Zmienianie hasła…">Zmień hasło</SubmitButton>
        </form>

        {/* Usunięcie konta */}
        <div className="customer-surface customer-profile-form" style={{ border: "1px solid #e0b4b4" }}>
          <div className="customer-section-title">
            <div>
              <span className="customer-eyebrow" style={{ color: "#c62828" }}>Strefa niebezpieczna</span>
              <h2 style={{ color: "#c62828" }}>Usuń konto</h2>
            </div>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--bark)", margin: "0 0 16px 0", lineHeight: 1.5 }}>
            Usunięcie konta spowoduje trwałą utratę dostępu do strefy klienta oraz historii powiadomień. 
            Twoje zamówienia i realizacje pozostaną bezpieczne w dokumentacji stolarni YAMURA.
          </p>

          {!showDeleteConfirm ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                background: "transparent",
                color: "#c62828",
                border: "1px solid #c62828",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "0.84rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Chcę usunąć konto
            </button>
          ) : (
            <form action={deleteAction} className="stack stack--medium" style={{ background: "#fff5f5", padding: "16px", borderRadius: "8px" }}>
              <p style={{ fontSize: "0.82rem", color: "#c62828", margin: 0, fontWeight: 600 }}>
                Aby bezpowrotnie usunąć konto, wpisz poniżej słowo <strong>USUŃ</strong> i kliknij przycisk:
              </p>
              <div className="field">
                <input name="confirmText" placeholder="Wpisz USUŃ" required style={{ maxWidth: "200px", textTransform: "uppercase" }} />
              </div>
              <FormMessage state={deleteState} />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    background: "#c62828",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Potwierdzam, usuń moje konto
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="button button--secondary button--small"
                >
                  Anuluj
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <aside className="customer-account-card">
        <div className="customer-account-monogram">{(profile.full_name || "Y").slice(0, 1)}</div>
        <span className="customer-eyebrow">Konto klienta</span>
        <h2>{profile.full_name || "Klient YAMURA"}</h2>
        <p>{email}</p>
        <div>
          <span>Status</span>
          <strong><i /> Aktywne</strong>
        </div>
        <small>Twoje dane są chronione i wykorzystywane wyłącznie do obsługi współpracy.</small>
      </aside>
    </div>
  );
}

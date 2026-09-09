"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { completeRegistration } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button className="button button--primary" type="submit" disabled={pending} style={{ width: "100%" }}>
      {pending ? "Tworzenie konta..." : "Załóż konto"}
    </button>
  );
}

export function RegisterForm({
  token,
  email,
  defaultName,
  defaultPhone,
}: {
  token: string;
  email: string;
  defaultName: string;
  defaultPhone: string;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function action(formData: FormData) {
    setError("");
    const pw1 = formData.get("password")?.toString();
    const pw2 = formData.get("passwordConfirm")?.toString();

    if (pw1 !== pw2) {
      setError("Hasła nie są identyczne.");
      return;
    }

    const res = await completeRegistration(token, formData);
    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Wystąpił błąd.");
    }
  }

  if (success) {
    return (
      <div className="stack stack--large" style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🎉</div>
        <h2 style={{ fontSize: "1.6rem" }}>Konto zostało utworzone!</h2>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          Możesz się teraz zalogować do Panelu Klienta przy użyciu adresu <strong>{email}</strong> oraz ustalonego hasła.
        </p>
        <Link href="/login" className="button button--primary" style={{ marginTop: "10px" }}>
          Przejdź do logowania
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="stack stack--large">
      {error && (
        <div className="form-message form-message--error">
          <span>{error}</span>
        </div>
      )}

      <div className="field">
        <label>Adres e-mail</label>
        <input type="email" value={email} disabled style={{ background: "var(--paper)" }} />
        <small>Adres e-mail jest przypisany do zaproszenia i nie można go zmienić.</small>
      </div>

      <div className="field">
        <label htmlFor="fullName">Imię i nazwisko</label>
        <input id="fullName" name="fullName" type="text" defaultValue={defaultName} required />
      </div>

      <div className="field">
        <label htmlFor="phone">Telefon</label>
        <input id="phone" name="phone" type="tel" defaultValue={defaultPhone} />
      </div>

      <div className="field">
        <label htmlFor="password">Hasło (min. 8 znaków)</label>
        <input id="password" name="password" type="password" required minLength={8} />
      </div>

      <div className="field">
        <label htmlFor="passwordConfirm">Powtórz hasło</label>
        <input id="passwordConfirm" name="passwordConfirm" type="password" required minLength={8} />
      </div>

      <div style={{ marginTop: "12px" }}>
        <SubmitButton />
      </div>
    </form>
  );
}

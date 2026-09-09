"use client";

import { FormEvent, useState } from "react";

type ComplaintProject = {
  number: string;
  title: string;
};

export function CustomerComplaintForm({ projects }: { projects: ComplaintProject[] }) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="customer-surface customer-complaint-section" id="reklamacje">
      <div className="customer-section-title">
        <div>
          <span className="customer-eyebrow">Reklamacje i serwis</span>
          <h2>Zgłoś problem z realizacją</h2>
        </div>
        <span className="customer-complaint-status"><i /> Brak aktywnych zgłoszeń</span>
      </div>

      <p className="customer-complaint-intro">
        Opisz usterkę lub potrzebę serwisową. Zgłoszenie zostanie połączone z projektem i trafi bezpośrednio do zespołu YAMURA.
      </p>

      <form className="customer-complaint-form" onSubmit={handleSubmit}>
        <label>
          <span>Projekt, którego dotyczy zgłoszenie</span>
          <select name="project" required defaultValue="">
            <option value="" disabled>Wybierz projekt</option>
            {projects.map((project) => (
              <option key={project.number} value={project.number}>{project.number} · {project.title}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Rodzaj zgłoszenia</span>
          <select name="category" defaultValue="usterka">
            <option value="usterka">Usterka wymagająca naprawy</option>
            <option value="regulacja">Regulacja lub serwis</option>
            <option value="brak">Brakujący element</option>
            <option value="inne">Inne zgłoszenie</option>
          </select>
        </label>
        <label className="customer-field-wide">
          <span>Opis zgłoszenia</span>
          <textarea name="description" required minLength={10} maxLength={1200} placeholder="Napisz, czego dotyczy problem i kiedy został zauważony." />
        </label>
        <label className="customer-complaint-upload customer-field-wide">
          <span>Zdjęcia lub dokumenty</span>
          <input type="file" name="attachments" accept="image/*,.pdf" multiple />
          <small>W wersji docelowej pliki trafią do prywatnego archiwum projektu.</small>
        </label>
        <div className="customer-complaint-actions customer-field-wide">
          <button className="customer-button customer-button--dark" type="submit">Wyślij zgłoszenie <span>→</span></button>
          <small>To wersja demonstracyjna — zgłoszenie nie zostanie zapisane ani wysłane.</small>
        </div>
      </form>

      {submitted && (
        <div className="customer-demo-success customer-complaint-success" role="status">
          Zgłoszenie YMR/R/2026/014 zostało utworzone w podglądzie demonstracyjnym. W gotowej wersji jego status i odpowiedzi będą widoczne w tym miejscu.
        </div>
      )}
    </section>
  );
}

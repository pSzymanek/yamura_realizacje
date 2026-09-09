"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AttachmentGallery } from "@/components/attachment-gallery";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ProgressTimeline } from "@/components/progress-timeline";
import { ProjectDetailsForm } from "@/components/project-details-form";
import { ProjectOperations } from "@/components/project-operations";
import { StatusBadge } from "@/components/status-badge";
import { UpdateForm } from "@/components/update-form";
import {
  addProjectDocumentAction,
  deleteProjectDocumentAction,
  deleteProjectUpdateAction,
  updateProjectBasicInfoAction,
  updateProjectDateAction,
  updateProjectEntryAction,
  updateProjectNextStepAction,
  updateProjectStageAction,
} from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { CORE_STAGES, getNormalizedStage } from "@/lib/statuses";
import type { ProjectDetails, ProjectUpdate } from "@/lib/types";

type AdminProjectLiveViewProps = {
  project: ProjectDetails;
  caseArchive?: ProjectDetails | null;
  clientLink: string;
  wasCreated?: boolean;
};

export function AdminProjectLiveView({
  project,
  caseArchive,
  clientLink,
  wasCreated = false,
}: AdminProjectLiveViewProps) {
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [isAddingDoc, setIsAddingDoc] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "ok" | "err" } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Granular inline edit states
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [dateValue, setDateValue] = useState(project.next_step_date || "");

  const [isEditingNextStep, setIsEditingNextStep] = useState(false);
  const [nextStepValue, setNextStepValue] = useState(project.next_step || "");

  const [editingUpdateId, setEditingUpdateId] = useState<string | null>(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateDesc, setUpdateDesc] = useState("");

  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [basicTitle, setBasicTitle] = useState(project.title);
  const [basicCustName, setBasicCustName] = useState(project.customer_name || "");
  const [basicCustEmail, setBasicCustEmail] = useState(project.customer_email || "");

  const isRealizationPhase = Boolean(getNormalizedStage(project.status));

  const handleStageChange = (newStage: string) => {
    startTransition(async () => {
      const res = await updateProjectStageAction(project.id, newStage);
      setFeedback({ text: res.message, type: res.ok ? "ok" : "err" });
      setIsChangingStage(false);
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleSaveDate = () => {
    startTransition(async () => {
      const res = await updateProjectDateAction(project.id, dateValue || null);
      setFeedback({ text: res.message, type: res.ok ? "ok" : "err" });
      if (res.ok) setIsEditingDate(false);
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleSaveNextStep = () => {
    startTransition(async () => {
      const res = await updateProjectNextStepAction(project.id, nextStepValue);
      setFeedback({ text: res.message, type: res.ok ? "ok" : "err" });
      if (res.ok) setIsEditingNextStep(false);
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleSaveEntry = (updateId: string) => {
    startTransition(async () => {
      const res = await updateProjectEntryAction(project.id, updateId, updateTitle, updateDesc);
      setFeedback({ text: res.message, type: res.ok ? "ok" : "err" });
      if (res.ok) setEditingUpdateId(null);
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleSaveBasicInfo = () => {
    startTransition(async () => {
      const res = await updateProjectBasicInfoAction(project.id, basicTitle, basicCustName, basicCustEmail);
      setFeedback({ text: res.message, type: res.ok ? "ok" : "err" });
      if (res.ok) setIsEditingBasicInfo(false);
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleDeleteUpdate = (updateId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten wpis z dziennika realizacji?")) {
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append("projectId", project.id);
      formData.append("updateId", updateId);
      const res = await deleteProjectUpdateAction({ ok: false, message: "" }, formData);
      setFeedback({ text: res.message, type: res.ok ? "ok" : "err" });
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleDeleteDoc = (docId: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć ten dokument z teczki projektu?")) {
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append("projectId", project.id);
      formData.append("docId", docId);
      const res = await deleteProjectDocumentAction({ ok: false, message: "" }, formData);
      setFeedback({ text: res.message, type: res.ok ? "ok" : "err" });
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  const handleAddDocSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const res = await addProjectDocumentAction({ ok: false, message: "" }, formData);
      setFeedback({ text: res.message, type: res.ok ? "ok" : "err" });
      if (res.ok) {
        setIsAddingDoc(false);
        form.reset();
      }
      setTimeout(() => setFeedback(null), 4000);
    });
  };

  return (
    <div className="panel-content customer-admin-live-wrapper">
      {/* Back link */}
      <Link href="/panel/realizacje" className="customer-back-link">
        ← Wszystkie realizacje
      </Link>

      {/* Was Created Banner */}
      {wasCreated && (
        <div className="success-banner" role="status" style={{ marginBottom: "24px" }}>
          <div>
            <strong>Projekt został pomyślnie utworzony.</strong>
            <span>
              {project.is_internal
                ? "Realizacja została zarejestrowana jako wewnętrzna (warsztatowa)."
                : "Skopiuj prywatny link i udostępnij go klientowi, aby mógł śledzić postępy."}
            </span>
          </div>
          {!project.is_internal && <CopyLinkButton link={clientLink} />}
        </div>
      )}

      {/* Floating feedback toast */}
      {feedback && (
        <div
          className={`admin-toast-feedback admin-toast-feedback--${feedback.type}`}
          role="alert"
        >
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)}>✕</button>
        </div>
      )}

      {/* Admin Live Preview Banner */}
      <aside className="admin-live-banner" aria-label="Pasek administratora">
        <div className="admin-live-banner__left">
          <span className="admin-live-banner__badge">TRYB ADMINISTRATORA · PODGLĄD 1:1 NA ŻYWO</span>
          <p>
            Widzisz dokładnie ten sam widok co klient. Możesz edytować dane bezpośrednio w ich kontekście.
          </p>
        </div>
        <div className="admin-live-banner__right">
          {!project.is_internal ? (
            <>
              <CopyLinkButton link={clientLink} />
              <a
                href={clientLink}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-ext-link-btn"
                title="Otwórz zewnętrzny widok klienta w nowej karcie"
              >
                Podgląd klienta ↗
              </a>
            </>
          ) : (
            <span className="internal-badge">Realizacja wewnętrzna (warsztat)</span>
          )}
        </div>
      </aside>

      {/* Customer-style Heading Section with Contextual Edit Button */}
      <header className="customer-page-heading admin-page-heading-live">
        <div className="customer-page-heading__main" style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span className="customer-eyebrow">{project.order_number}</span>
            {project.is_internal && <span className="internal-badge">Wewnętrzny</span>}
          </div>

          {isEditingBasicInfo ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px", maxWidth: "620px", padding: "16px", background: "#faf8f5", border: "1px solid #c5a77d", borderRadius: "2px" }}>
              <strong style={{ fontSize: "0.85rem", color: "#8b704f" }}>Edycja danych projektu i klienta</strong>
              <div>
                <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#716b64", display: "block", marginBottom: "3px", textTransform: "uppercase" }}>Nazwa realizacji</label>
                <input
                  type="text"
                  value={basicTitle}
                  onChange={(e) => setBasicTitle(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", fontSize: "0.9rem", border: "1px solid #d8d0c7", borderRadius: "2px", background: "#fff" }}
                />
              </div>
              {!project.is_internal && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#716b64", display: "block", marginBottom: "3px", textTransform: "uppercase" }}>Klient</label>
                    <input
                      type="text"
                      value={basicCustName}
                      onChange={(e) => setBasicCustName(e.target.value)}
                      placeholder="Imię i nazwisko"
                      style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", border: "1px solid #d8d0c7", borderRadius: "2px", background: "#fff" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#716b64", display: "block", marginBottom: "3px", textTransform: "uppercase" }}>E-mail</label>
                    <input
                      type="email"
                      value={basicCustEmail}
                      onChange={(e) => setBasicCustEmail(e.target.value)}
                      placeholder="adres@klienta.pl"
                      style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", border: "1px solid #d8d0c7", borderRadius: "2px", background: "#fff" }}
                    />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <button
                  type="button"
                  className="button button--primary"
                  style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.78rem" }}
                  onClick={handleSaveBasicInfo}
                  disabled={isPending}
                >
                  Zapisz
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  style={{ minHeight: "36px", padding: "6px 12px", fontSize: "0.78rem" }}
                  onClick={() => setIsEditingBasicInfo(false)}
                  disabled={isPending}
                >
                  Anuluj
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
                <h1>{project.title}</h1>
                <button
                  type="button"
                  onClick={() => setIsEditingBasicInfo(true)}
                  style={{ background: "none", border: "none", color: "#8b704f", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, padding: 0 }}
                  title="Edytuj nazwę projektu lub dane klienta"
                >
                  ✎ Zmień dane / klienta
                </button>
              </div>
              <p>
                {project.is_internal ? (
                  "Projekt warsztatowy na potrzeby własne / ekspozycji pracowni."
                ) : (
                  `${project.customer_name || "Brak danych klienta"} · ${project.customer_email || "Brak e-maila"}`
                )}
              </p>
            </>
          )}
        </div>

        <div className="customer-page-heading__actions" style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <StatusBadge status={project.status} />
        </div>
      </header>

      {/* Order Strip (1:1 with Customer View + Contextual Edit Triggers) */}
      <section className="customer-order-strip" aria-label="Parametry realizacji">
        <div className="admin-strip-cell">
          <div className="admin-strip-cell__info" style={{ width: "100%" }}>
            <span>Bieżące działanie</span>
            {isEditingNextStep ? (
              <div style={{ display: "flex", gap: "6px", marginTop: "6px", width: "100%", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={nextStepValue}
                  onChange={(e) => setNextStepValue(e.target.value)}
                  placeholder="Np. Dobór wybarwień forniru"
                  style={{ flex: 1, minWidth: "160px", padding: "6px 10px", fontSize: "0.85rem", border: "1px solid #d8d0c7", borderRadius: "2px", background: "#fff" }}
                  autoFocus
                />
                <button
                  type="button"
                  className="button button--primary"
                  style={{ minHeight: "34px", padding: "4px 12px", fontSize: "0.75rem" }}
                  onClick={handleSaveNextStep}
                  disabled={isPending}
                >
                  Zapisz
                </button>
                <button
                  type="button"
                  className="button button--secondary"
                  style={{ minHeight: "34px", padding: "4px 10px", fontSize: "0.75rem" }}
                  onClick={() => { setIsEditingNextStep(false); setNextStepValue(project.next_step || ""); }}
                  disabled={isPending}
                >
                  ✕
                </button>
              </div>
            ) : (
              <strong>{project.next_step || "W trakcie przygotowania"}</strong>
            )}
          </div>
          {!isEditingNextStep && (
            <button
              type="button"
              className="admin-strip-cell__btn"
              onClick={() => setIsEditingNextStep(true)}
              title="Zmień tylko bieżące działanie"
            >
              ✎ Zmień
            </button>
          )}
        </div>

        <div className="admin-strip-cell">
          <div className="admin-strip-cell__info" style={{ width: "100%" }}>
            <span>Planowany termin etapu</span>
            {isEditingDate ? (
              <div style={{ display: "flex", gap: "6px", marginTop: "6px", width: "100%", flexWrap: "wrap", alignItems: "center" }}>
                <input
                  type="date"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                  style={{ padding: "5px 8px", fontSize: "0.85rem", border: "1px solid #d8d0c7", borderRadius: "2px", background: "#fff" }}
                  autoFocus
                />
                <button
                  type="button"
                  className="button button--primary"
                  style={{ minHeight: "34px", padding: "4px 12px", fontSize: "0.75rem" }}
                  onClick={handleSaveDate}
                  disabled={isPending}
                >
                  Zapisz
                </button>
                {dateValue && (
                  <button
                    type="button"
                    className="button button--secondary"
                    style={{ minHeight: "34px", padding: "4px 8px", fontSize: "0.75rem" }}
                    onClick={() => { setDateValue(""); }}
                    title="Wyczyść termin"
                    disabled={isPending}
                  >
                    Usuń
                  </button>
                )}
                <button
                  type="button"
                  className="button button--secondary"
                  style={{ minHeight: "34px", padding: "4px 10px", fontSize: "0.75rem" }}
                  onClick={() => { setIsEditingDate(false); setDateValue(project.next_step_date || ""); }}
                  disabled={isPending}
                >
                  ✕
                </button>
              </div>
            ) : (
              <strong style={{ color: project.next_step_date ? "#d49b28" : undefined }}>
                {project.next_step_date ? formatDate(project.next_step_date) : "Do potwierdzenia"}
              </strong>
            )}
          </div>
          {!isEditingDate && (
            <button
              type="button"
              className="admin-strip-cell__btn"
              onClick={() => setIsEditingDate(true)}
              title="Zmień tylko planowany termin"
            >
              ✎ Zmień termin
            </button>
          )}
        </div>

        <div className="admin-strip-cell">
          <div className="admin-strip-cell__info">
            <span>Ostatnia zmiana w pracowni</span>
            <strong>{formatDate(project.updated_at)}</strong>
          </div>
          <span className="admin-strip-cell__tag">Automatyczna</span>
        </div>
      </section>

      {/* Pre-production banner if project is in inquiry / quote stage */}
      {!isRealizationPhase && (
        <div className="admin-phase-advance-card" style={{ marginBottom: "28px" }}>
          <div>
            <span className="customer-eyebrow">Etap ofertowy / przygotowanie</span>
            <h3>Projekt w fazie zapytania i opracowania wyceny</h3>
            <p>
              Projekt ma nadany numer <strong>{project.order_number}</strong>. Klient widzi w tej chwili przygotowanie do realizacji. Gdy ustalenia zostaną zatwierdzone, możesz jednym kliknięciem rozpocząć realizację stolarską.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              type="button"
              className="admin-contextual-btn admin-contextual-btn--accent"
              onClick={() => handleStageChange("design")}
              disabled={isPending}
            >
              Rozpocznij realizację stolarską (Projekt i pomiary) →
            </button>
          </div>
        </div>
      )}

      {/* Progress Timeline Section (1:1 with Customer View + Quick Stage Advance) */}
      <section className="customer-surface" style={{ marginBottom: "36px" }}>
            <div className="section-header-clean" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <span className="customer-eyebrow">Przebieg realizacji</span>
                <h2>Oś czasu realizacji</h2>
                <p>
                  Wybierz aktywny etap, aby zobaczyć szczegółowe podetapy, notatki technologiczne i fotografie z procesu obróbki.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingUpdate(true);
                    const el = document.getElementById("journal-section");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="admin-contextual-btn admin-contextual-btn--accent"
                  title="Dodaj nowy wpis lub podetap ze zdjęciami"
                >
                  + Dodaj wpis do etapu
                </button>
                <button
                  type="button"
                  onClick={() => setIsChangingStage(!isChangingStage)}
                  className={`admin-contextual-btn ${isChangingStage ? "admin-contextual-btn--active" : ""}`}
                >
                  {isChangingStage ? "✕ Anuluj wybór" : "⇄ Zmień etap główny"}
                </button>
              </div>
            </div>

            {/* Quick Stage Switcher Pills */}
            {isChangingStage && (
              <div className="admin-stage-quick-panel">
                <div style={{ marginBottom: "12px", fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                  Kliknij etap, aby natychmiast przestawić główny status realizacji:
                </div>
                <div className="admin-stage-pills-grid">
                  {CORE_STAGES.map((st) => {
                    const isCurrent = getNormalizedStage(project.status) === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStageChange(st.id)}
                        disabled={isPending}
                        className={`admin-stage-pill ${isCurrent ? "is-current" : ""}`}
                      >
                        <strong>{st.code}.</strong>
                        <span>{st.label}</span>
                        {isCurrent && <small>Bieżący etap</small>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <ProgressTimeline currentStatus={project.status} updates={project.updates} variant="staff" />
          </section>

          {/* Customer Two Column Clean Section: Journal (left) + Documents (right) */}
          <div className="customer-two-column-clean">
            {/* Left Column: Dziennik pracowni */}
            <section id="journal-section" className="customer-surface">
              <div className="customer-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <span className="customer-eyebrow">Dziennik pracowni</span>
                  <h2>Wpisy z realizacji</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <b style={{ color: "#d49b28" }}>{project.updates.length}</b>
                  <button
                    type="button"
                    onClick={() => setIsAddingUpdate(!isAddingUpdate)}
                    className={`admin-contextual-btn admin-contextual-btn--accent ${isAddingUpdate ? "admin-contextual-btn--active" : ""}`}
                    title="Dodaj nowy wpis lub podetap z fotografiami"
                  >
                    {isAddingUpdate ? "✕ Zwiń formularz" : "+ Dodaj wpis do dziennika"}
                  </button>
                </div>
              </div>

              {/* Inline Update Form directly above the entries */}
              {isAddingUpdate && (
                <div className="admin-inline-update-wrapper" style={{ margin: "24px 0" }}>
                  <UpdateForm project={project} />
                </div>
              )}

              {/* Customer Update List with Contextual Admin Triggers */}
              <div className="customer-update-list">
                {project.updates.map((update) => (
                  <article key={update.id} className="admin-journal-article">
                    <div className="customer-update-list__date">
                      <strong>
                        {new Intl.DateTimeFormat("pl-PL", { day: "2-digit" }).format(
                          new Date(update.created_at),
                        )}
                      </strong>
                      <span>
                        {new Intl.DateTimeFormat("pl-PL", {
                          month: "short",
                          year: "numeric",
                        }).format(new Date(update.created_at))}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="admin-journal-article__top">
                        <span className="customer-eyebrow">
                          {update.stage ? `Etap: ${update.stage}` : "Wpis w dzienniku"}
                          {update.event_date && ` · Zdarzenie: ${formatDate(update.event_date)}`}
                          {update.author_name && ` · ${update.author_name}`}
                        </span>

                        <div className="admin-entry-actions">
                          <button
                            type="button"
                            className="admin-entry-action-btn"
                            onClick={() => {
                              if (editingUpdateId === update.id) {
                                setEditingUpdateId(null);
                              } else {
                                setEditingUpdateId(update.id);
                                setUpdateTitle(update.title);
                                setUpdateDesc(update.description);
                              }
                            }}
                            title="Edytuj treść wpisu"
                          >
                            {editingUpdateId === update.id ? "✕ Zamknij" : "✎ Edytuj"}
                          </button>
                          <button
                            type="button"
                            className="admin-entry-action-btn admin-entry-action-btn--danger"
                            onClick={() => handleDeleteUpdate(update.id)}
                            title="Usuń wpis z dziennika"
                            disabled={isPending}
                          >
                            ✕ Usuń
                          </button>
                        </div>
                      </div>

                      {editingUpdateId === update.id ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "12px 0 16px", padding: "14px", background: "#faf8f5", border: "1px solid #c5a77d", borderRadius: "2px" }}>
                          <div>
                            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#716b64", display: "block", marginBottom: "3px", textTransform: "uppercase" }}>Tytuł wpisu</label>
                            <input
                              type="text"
                              value={updateTitle}
                              onChange={(e) => setUpdateTitle(e.target.value)}
                              style={{ width: "100%", padding: "8px 10px", fontSize: "0.9rem", border: "1px solid #d8d0c7", borderRadius: "2px", background: "#fff" }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "#716b64", display: "block", marginBottom: "3px", textTransform: "uppercase" }}>Opis / Notatka</label>
                            <textarea
                              rows={3}
                              value={updateDesc}
                              onChange={(e) => setUpdateDesc(e.target.value)}
                              style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem", border: "1px solid #d8d0c7", borderRadius: "2px", background: "#fff", resize: "vertical" }}
                            />
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              type="button"
                              className="button button--primary"
                              style={{ minHeight: "34px", padding: "4px 14px", fontSize: "0.78rem" }}
                              onClick={() => handleSaveEntry(update.id)}
                              disabled={isPending}
                            >
                              Zapisz wpis
                            </button>
                            <button
                              type="button"
                              className="button button--secondary"
                              style={{ minHeight: "34px", padding: "4px 10px", fontSize: "0.78rem" }}
                              onClick={() => setEditingUpdateId(null)}
                              disabled={isPending}
                            >
                              Anuluj
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3>{update.title}</h3>
                          <p>{update.description}</p>
                        </>
                      )}
                      <AttachmentGallery attachments={update.attachments} />
                    </div>
                  </article>
                ))}

                {!project.updates.length && (
                  <div className="customer-empty-state">
                    <h3>Dziennik czeka na pierwszy wpis</h3>
                    <p>
                      Kliknij przycisk „+ Dodaj wpis do dziennika” u góry, aby opublikować pierwszą notatkę technologiczną i fotografie z procesu.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Right Column: Dokumentacja (Teczka projektu) */}
            <aside className="customer-surface customer-documents">
              <div className="customer-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span className="customer-eyebrow">Teczka projektu</span>
                  <h2>Dokumentacja</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(!isAddingDoc)}
                  className="admin-contextual-btn"
                  style={{ whiteSpace: "nowrap", padding: "6px 12px", fontSize: "0.72rem", flexShrink: 0 }}
                  title="Dołącz nowy dokument do teczki zamówienia"
                >
                  {isAddingDoc ? "✕ Zwiń" : "+ Dodaj dokument"}
                </button>
              </div>

              <p style={{ margin: "6px 0 20px", color: "var(--muted, #666)", fontSize: "0.85rem" }}>
                Zestawienie dokumentów formalnych i technicznych powiązanych z zamówieniem {project.order_number}.
              </p>

              {/* Inline Document Addition Form */}
              {isAddingDoc && (
                <form onSubmit={handleAddDocSubmit} className="admin-inline-doc-form">
                  <input type="hidden" name="projectId" value={project.id} />
                  <h4>Nowy dokument w teczce</h4>
                  <div className="field">
                    <label htmlFor="docName">Nazwa dokumentu</label>
                    <input
                      id="docName"
                      name="name"
                      placeholder="np. Projekt wykonawczy instalacji v2"
                      required
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="docNumber">Numer dokumentu (opcjonalnie)</label>
                    <input
                      id="docNumber"
                      name="number"
                      placeholder="np. DOC/2026/084-05"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="docCategory">Kategoria</label>
                    <select id="docCategory" name="category" defaultValue="project">
                      <option value="project">Rysunek / Projekt techniczny</option>
                      <option value="quote">Wycena / Oferta</option>
                      <option value="contract">Umowa</option>
                      <option value="measurement">Protokół pomiaru</option>
                      <option value="invoice">Faktura / Rozliczenie</option>
                    </select>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                    <button type="submit" className="admin-contextual-btn admin-contextual-btn--accent" disabled={isPending}>
                      Zapisz w teczce
                    </button>
                    <button type="button" className="admin-contextual-btn" onClick={() => setIsAddingDoc(false)}>
                      Anuluj
                    </button>
                  </div>
                </form>
              )}

              {/* Documents List */}
              {(project.documents || []).map((doc) => (
                <div key={doc.id} className="admin-doc-row">
                  <a
                    href={doc.url && doc.url !== "#" ? doc.url : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="admin-doc-download-btn"
                    title="Otwórz plik dokumentu"
                    style={{ textDecoration: "none" }}
                  >
                    <i>{doc.url?.endsWith(".pdf") ? "PDF" : "PLIK"}</i>
                    <span>
                      <strong>{doc.name}</strong>
                      <small>{doc.number} · {doc.status}</small>
                    </span>
                    <b>↓</b>
                  </a>
                  <button
                    type="button"
                    className="admin-doc-del-btn"
                    onClick={() => handleDeleteDoc(doc.id)}
                    title="Usuń dokument z teczki"
                    disabled={isPending}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {!(project.documents || []).length && (
                <p className="customer-documents__note">Brak dokumentów w teczce projektu.</p>
              )}
            </aside>
          </div>
    </div>
  );
}

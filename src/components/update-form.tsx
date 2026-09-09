"use client";

import { useActionState, useEffect, useRef } from "react";

import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { publishUpdateAction } from "@/lib/actions";
import { CORE_STAGES, getNormalizedStage, PROJECT_STATUSES } from "@/lib/statuses";
import type { ProjectDetails } from "@/lib/types";
import { INITIAL_ACTION_STATE } from "@/lib/types";

export function UpdateForm({ project }: { project: ProjectDetails }) {
  const [state, action] = useActionState(publishUpdateAction, INITIAL_ACTION_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="card form-card stack stack--large">
      <input type="hidden" name="projectId" value={project.id} />
      <div className="section-heading section-heading--compact">
        <div>
          <span className="eyebrow">Dziennik</span>
          <h2>Nowy podetap / aktualizacja</h2>
        </div>
      </div>

      <div className="form-grid">
        <div className="field">
          <label htmlFor="updateStage">Główny etap realizacji</label>
          <select
            id="updateStage"
            name="stage"
            defaultValue={getNormalizedStage(project.status) || "design"}
          >
            {CORE_STAGES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.code}. {st.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="eventDate">Data podetapu / zdarzenia</label>
          <input
            id="eventDate"
            name="eventDate"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="updateTitle">Tytuł podetapu</label>
        <input id="updateTitle" name="title" placeholder="np. Pomiar laserowy 3D, Próbny montaż frontów…" maxLength={160} required />
      </div>
      <div className="field">
        <label htmlFor="updateDescription">Komentarz / opis prac</label>
        <textarea
          id="updateDescription"
          name="description"
          rows={5}
          placeholder="Szczegółowy opis wykonanych prac, uwagi stolarskie, uzgodnienia z inwestorem…"
          maxLength={5000}
          required
        />
      </div>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="updateStatus">Nowy status</label>
          <select id="updateStatus" name="status" defaultValue="">
            <option value="">Bez zmiany statusu</option>
            {PROJECT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="updateDate">Orientacyjna data</label>
          <input
            id="updateDate"
            name="nextStepDate"
            type="date"
            defaultValue={project.next_step_date || ""}
          />
        </div>
        <div className="field field--wide">
          <label htmlFor="updateNextStep">Następny krok</label>
          <input
            id="updateNextStep"
            name="nextStep"
            defaultValue={project.next_step || ""}
            maxLength={300}
          />
        </div>
        <div className="field field--wide">
          <label htmlFor="photos">Zdjęcia</label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
          />
          <small>Maksymalnie 4 pliki JPG, PNG lub WebP, po 6 MB każdy.</small>
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Publikowanie…">Opublikuj aktualizację</SubmitButton>
    </form>
  );
}

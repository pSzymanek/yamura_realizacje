"use client";

import { useState } from "react";
import {
  CORE_STAGES,
  getNormalizedStage,
  type ProjectStatus,
} from "@/lib/statuses";
import type { Attachment, ProjectUpdate } from "@/lib/types";
import { formatDate } from "@/lib/format";

type ProgressTimelineProps = {
  currentStatus: ProjectStatus | string;
  updates?: ProjectUpdate[];
  variant?: "client" | "staff";
};

export function ProgressTimeline({
  currentStatus,
  updates = [],
  variant = "client",
}: ProgressTimelineProps) {
  const normalizedStage = getNormalizedStage(currentStatus as ProjectStatus);
  const isPreProduction = normalizedStage === null;
  const currentStageId = normalizedStage || "design";
  const currentIndex = isPreProduction ? -1 : CORE_STAGES.findIndex((s) => s.id === currentStageId);

  const updatesByStage: Record<string, ProjectUpdate[]> = {};
  for (const stage of CORE_STAGES) {
    updatesByStage[stage.id] = [];
  }

  for (const update of updates) {
    let stageId = update.stage || "";
    if (!stageId && update.status) {
      stageId = getNormalizedStage(update.status as ProjectStatus) || "";
    }
    if (!stageId || !updatesByStage[stageId]) {
      stageId = currentStageId || "design";
    }
    if (updatesByStage[stageId]) {
      updatesByStage[stageId].push(update);
    }
  }

  const [selectedStageId, setSelectedStageId] = useState<string>(currentStageId);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const selectedStage =
    CORE_STAGES.find((s) => s.id === selectedStageId) ||
    CORE_STAGES[currentIndex] ||
    CORE_STAGES[0];
  const selectedSubsteps = updatesByStage[selectedStage.id] || [];
  const isSelectedPassed =
    !isPreProduction &&
    (CORE_STAGES.findIndex((s) => s.id === selectedStage.id) < currentIndex ||
      currentStatus === "completed");
  const isSelectedCurrent = !isPreProduction && selectedStage.id === currentStageId;

  return (
    <div className={`yamura-timeline yamura-timeline--${variant}`}>
      {/* Lightbox Modal */}
      {activePhoto && (
        <div
          className="yamura-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePhoto(null)}
        >
          <div className="yamura-lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto} alt="Fotografia z pracowni YAMURA" />
            <button
              className="yamura-lightbox__close"
              type="button"
              onClick={() => setActivePhoto(null)}
              aria-label="Zamknij podgląd"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Stepper */}
      <div className="milestone-stepper" role="tablist" aria-label="Oś czasu realizacji">
        {CORE_STAGES.map((stage, idx) => {
          const isCurrent = !isPreProduction && stage.id === currentStageId;
          const isPassed = !isPreProduction && (idx < currentIndex || currentStatus === "completed");
          const isUpcoming = isPreProduction || (!isCurrent && !isPassed);
          const isSelected = !isPreProduction && stage.id === selectedStageId;
          const count = updatesByStage[stage.id]?.length || 0;

          let statusClass = "is-upcoming";
          if (isCurrent) statusClass = "is-current";
          else if (isPassed) statusClass = "is-passed";

          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-disabled={isUpcoming}
              disabled={isUpcoming}
              className={`stepper-step ${statusClass} ${isSelected ? "is-selected" : ""} ${isUpcoming ? "is-disabled" : ""}`}
              onClick={() => {
                if (!isUpcoming) {
                  setSelectedStageId(stage.id);
                }
              }}
              title={isUpcoming ? "Etap jeszcze nierozpoczęty" : undefined}
            >
              <div className="stepper-step__top">
                <span className="stepper-step__code">
                  {isPassed && !isCurrent ? "✓" : stage.code}
                </span>
                <span className="stepper-step__line" aria-hidden="true" />
              </div>
              <div className="stepper-step__content">
                <span className="stepper-step__name">{stage.label}</span>
                <span className="stepper-step__meta">
                  {count > 0 ? `${count} ${count === 1 ? "wpis" : "wpisy"}` : isUpcoming ? "nierozpoczęty" : "w toku"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active / Selected Stage Detail & Vertical Substeps */}
      <div className="stage-detail-panel">
        {isPreProduction ? (
          <header className="stage-detail-panel__header">
            <div>
              <span className="stage-detail-panel__badge" style={{ background: "rgba(197, 167, 125, 0.12)", color: "#8b704f", borderColor: "#c5a77d" }}>
                Etap wstępny · Przygotowanie oferty
              </span>
              <h3 className="stage-detail-panel__title">
                Przygotowanie do rozpoczęcia realizacji
              </h3>
              <p className="stage-detail-panel__desc">
                Projekt znajduje się obecnie w fazie wstępnych uzgodnień, wyceny lub formalności. Po zatwierdzeniu oferty i podpisaniu umowy, pracownia rozpocznie etap 01 (Projekt i Pomiary laserowe).
              </p>
            </div>
            <div className="stage-detail-panel__counter">
              <span>Etapy 01–05 w kolejce do uruchomienia</span>
            </div>
          </header>
        ) : (
          <>
            <header className="stage-detail-panel__header">
              <div>
                <span className="stage-detail-panel__badge">
                  {isSelectedPassed && !isSelectedCurrent
                    ? "✓ Etap ukończony"
                    : isSelectedCurrent
                    ? "★ Bieżący etap w pracowni"
                    : "Etap w kolejce"}
                </span>
                <h3 className="stage-detail-panel__title">
                  <span className="stage-detail-panel__code">{selectedStage.code}.</span> {selectedStage.label}
                </h3>
                <p className="stage-detail-panel__desc">{selectedStage.description}</p>
              </div>
              <div className="stage-detail-panel__counter">
                <span>{selectedSubsteps.length} {selectedSubsteps.length === 1 ? "wpis z dokumentacją" : "wpisy z dokumentacją"}</span>
              </div>
            </header>

        <div className="stage-substeps-vertical">
          {selectedSubsteps.length > 0 ? (
            selectedSubsteps.map((substep, subIdx) => (
              <article key={substep.id || subIdx} className="substep-entry">
                <div className="substep-entry__axis" aria-hidden="true">
                  <span className="substep-entry__dot" />
                  {subIdx < selectedSubsteps.length - 1 && <span className="substep-entry__connector" />}
                </div>

                <div className="substep-entry__content">
                  <div className="substep-entry__meta-row">
                    <time className="substep-entry__date">
                      {(substep.event_date || substep.created_at) ? formatDate(substep.event_date || substep.created_at) : ""}
                    </time>
                    {substep.author_name && (
                      <span className="substep-entry__author">
                        {substep.author_name}
                      </span>
                    )}
                  </div>

                  <h4 className="substep-entry__title">{substep.title}</h4>
                  <p className="substep-entry__text">{substep.description}</p>

                  {substep.attachments && substep.attachments.length > 0 && (
                    <div className="substep-entry__photos">
                      {substep.attachments.map((att: Attachment) => {
                        const imgUrl = att.signed_url || att.storage_path;
                        return (
                          <button
                            key={att.id || att.storage_path}
                            type="button"
                            className="substep-photo-thumb"
                            onClick={() => setActivePhoto(imgUrl)}
                            title={`Powiększ zdjęcie: ${att.original_filename || "warsztat YAMURA"}`}
                          >
                            <img src={imgUrl} alt={att.original_filename || "Zdjęcie z realizacji"} loading="lazy" />
                            <span className="substep-photo-thumb__overlay">Powiększ</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="substep-empty-state">
              <p>
                {isSelectedCurrent
                  ? "Prace w ramach tego etapu trwają. Wkrótce mistrz stolarki doda pierwsze wpisy i zdjęcia z procesu obróbki."
                  : "Dla tego etapu nie zarejestrowano jeszcze wpisów w dzienniku."}
              </p>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}

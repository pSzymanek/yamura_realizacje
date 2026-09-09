"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { calculateStageCountdown } from "@/lib/countdown";
import { CORE_STAGES, getNormalizedStage, type ProjectStatus } from "@/lib/statuses";
import type { ProjectListItem, ProjectDetails } from "@/lib/types";
import { useActiveProjectSync } from "@/components/active-project-sync-context";

type SidebarCountdownProps = {
  project?: ProjectListItem | ProjectDetails | null;
  projects?: (ProjectListItem | ProjectDetails)[];
  hrefPrefix?: string;
};

export function SidebarCountdown({
  project,
  projects,
  hrefPrefix = "/konto/realizacje",
}: SidebarCountdownProps) {
  const sync = useActiveProjectSync();

  const [localIndex, setLocalIndex] = useState(0);
  const [localPaused, setLocalPaused] = useState(false);
  const [localFadeKey, setLocalFadeKey] = useState(0);

  const list = sync
    ? sync.projects
    : (projects && projects.length > 0)
    ? projects
    : project
    ? [project]
    : [];

  const total = sync ? sync.total : list.length;

  useEffect(() => {
    if (sync || total <= 1 || localPaused) return;

    const timer = setInterval(() => {
      setLocalIndex((prev) => (prev + 1) % total);
      setLocalFadeKey((k) => k + 1);
    }, 10000);

    return () => clearInterval(timer);
  }, [sync, total, localPaused]);

  const currentIndex = sync ? sync.currentIndex : localIndex;
  const activeProject = sync ? sync.currentProject : (list[currentIndex] || list[0] || null);
  const fadeKey = sync ? sync.fadeKey : localFadeKey;

  if (!activeProject) return null;

  const countdown = calculateStageCountdown(activeProject.next_step_date, activeProject.status);
  const stageId = getNormalizedStage(activeProject.status as ProjectStatus);
  const coreStage = CORE_STAGES.find((s) => s.id === stageId);
  const stageLabel = coreStage?.label || "Realizacja w toku";

  const handleMouseEnter = () => {
    if (sync) sync.setIsPaused(true);
    else setLocalPaused(true);
  };

  const handleMouseLeave = () => {
    if (sync) sync.setIsPaused(false);
    else setLocalPaused(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sync) {
      sync.goToPrev();
    } else {
      setLocalIndex((prev) => (prev - 1 + total) % total);
      setLocalFadeKey((k) => k + 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (sync) {
      sync.goToNext();
    } else {
      setLocalIndex((prev) => (prev + 1) % total);
      setLocalFadeKey((k) => k + 1);
    }
  };

  const handleGoToIndex = (idx: number) => {
    if (sync) {
      sync.goToIndex(idx);
    } else {
      setLocalIndex(idx);
      setLocalFadeKey((k) => k + 1);
    }
  };

  return (
    <div
      className="sidebar-countdown-wrap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      <div
        className="sidebar-countdown-card"
        key={fadeKey}
        style={{
          display: "block",
          animation: "slideLeftIn 0.35s ease-out",
          position: "relative",
        }}
      >
        <div className="sidebar-countdown-card__header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="sidebar-countdown-card__eyebrow" style={{ color: "#38b26d", display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span className="sidebar-countdown-pulse" aria-hidden="true" />
            W realizacji
          </span>
          <span className="sidebar-countdown-card__order">{activeProject.order_number}</span>
        </div>

        <Link
          href={`${hrefPrefix}/${activeProject.id}`}
          style={{ textDecoration: "none", color: "inherit", display: "block" }}
          title={`Otwórz realizację ${activeProject.order_number}`}
        >
          <strong className="sidebar-countdown-card__stage" style={{ color: "#fff", display: "block" }}>
            {activeProject.is_internal ? "Pracownia (wewnętrzny)" : (activeProject.customer_name || activeProject.title)}
          </strong>
          <small style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.74rem", display: "block", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeProject.title}
          </small>

          <div className="sidebar-countdown-card__metric" style={{ margin: "14px 0 12px" }}>
            {countdown.days !== null ? (
              <>
                <span
                  className="sidebar-countdown-card__number"
                  style={{ color: "#38b26d", fontWeight: 500 }}
                >
                  {countdown.days < 0 ? `+${Math.abs(countdown.days)}` : countdown.days}
                </span>
                <div className="sidebar-countdown-card__unit-wrap">
                  <span className="sidebar-countdown-card__unit" style={{ color: "#fff" }}>
                    {Math.abs(countdown.days) === 1 ? "dzień" : "dni"}
                  </span>
                  <span className="sidebar-countdown-card__label" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {countdown.days < 0 ? "po planie" : "do końca etapu"}
                  </span>
                </div>
              </>
            ) : (
              <span className="sidebar-countdown-card__pending" style={{ color: "#38b26d" }}>
                Termin w ustalaniu
              </span>
            )}
          </div>
        </Link>

        <div
          className="sidebar-countdown-card__footer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: "1px solid rgba(40, 122, 76, 0.25)",
          }}
        >
          <Link
            href={`${hrefPrefix}/${activeProject.id}`}
            style={{
              textDecoration: "none",
              color: "#82c99b",
              fontSize: "0.74rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              transition: "color 0.2s ease",
            }}
          >
            Szczegóły →
          </Link>
        </div>
      </div>

      {total > 1 && (
        <div className="sidebar-countdown-switcher">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Poprzednia realizacja"
            style={{
              background: "transparent",
              border: "none",
              color: "#82c99b",
              padding: "6px 10px",
              fontSize: "1rem",
              cursor: "pointer",
              lineHeight: 1,
              transition: "opacity 0.2s, transform 0.15s",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            title="Poprzednia realizacja"
          >
            ←
          </button>

          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {list.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGoToIndex(idx);
                }}
                aria-label={`Przełącz na realizację ${item.order_number}`}
                title={`Przełącz na realizację ${item.order_number}`}
                style={{
                  width: idx === currentIndex ? "14px" : "5px",
                  height: "4px",
                  borderRadius: "2px",
                  background: idx === currentIndex ? "#38b26d" : "rgba(255,255,255,0.25)",
                  boxShadow: idx === currentIndex ? "0 0 6px rgba(56, 178, 109, 0.5)" : "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Następna realizacja"
            style={{
              background: "transparent",
              border: "none",
              color: "#82c99b",
              padding: "6px 10px",
              fontSize: "1rem",
              cursor: "pointer",
              lineHeight: 1,
              transition: "opacity 0.2s, transform 0.15s",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            title="Następna realizacja"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
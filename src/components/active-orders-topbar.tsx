"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProjectListItem, ProjectDetails } from "@/lib/types";
import { useActiveProjectSync } from "@/components/active-project-sync-context";

type ActiveOrdersTopbarProps = {
  projects?: (ProjectListItem | ProjectDetails)[];
};

export function ActiveOrdersTopbar({ projects = [] }: ActiveOrdersTopbarProps) {
  const sync = useActiveProjectSync();

  // Local state fallback if sync provider is not present
  const [localIndex, setLocalIndex] = useState(0);
  const [localPaused, setLocalPaused] = useState(false);
  const [localFadeKey, setLocalFadeKey] = useState(0);

  const list = sync ? sync.projects : projects;
  const total = sync ? sync.total : list.length;

  useEffect(() => {
    if (sync || total <= 1 || localPaused) return;

    const interval = setInterval(() => {
      setLocalIndex((prev) => (prev + 1) % total);
      setLocalFadeKey((k) => k + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, [sync, total, localPaused]);

  if (total === 0) return null;

  const currentIndex = sync ? sync.currentIndex : localIndex;
  const currentProject = sync ? sync.currentProject : (list[currentIndex] || list[0]);
  const fadeKey = sync ? sync.fadeKey : localFadeKey;

  if (!currentProject) return null;

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

  return (
    <div
      className="customer-topbar__active-orders"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: "flex", alignItems: "center", gap: "8px" }}
    >
      <span className="customer-topbar__orders-label">Aktywne realizacje:</span>

      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {total > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Poprzednia realizacja"
            style={{
              background: "transparent",
              border: "none",
              color: "#8b704f",
              padding: "4px 6px",
              fontSize: "0.95rem",
              cursor: "pointer",
              lineHeight: 1,
              borderRadius: "2px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#171717")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b704f")}
            title="Poprzednia realizacja"
          >
            ‹
          </button>
        )}

        <div className="customer-topbar__pills" style={{ display: "flex", alignItems: "center" }}>
          <Link
            key={`${currentProject.id}-${fadeKey}`}
            href={`/konto/realizacje/${currentProject.id}`}
            className="customer-order-pill is-active-pill"
            title={`${currentProject.title} (${currentProject.order_number})`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "2px",
              border: "1px solid #8b704f",
              background: "#fff",
              textDecoration: "none",
              animation: "slideLeftIn 0.35s ease-out",
              boxShadow: "0 2px 6px rgba(139, 112, 79, 0.12)",
              transition: "all 0.25s ease",
            }}
          >
            <strong style={{ fontSize: "0.82rem", color: "#171717", letterSpacing: "0.02em" }}>
              {currentProject.order_number}
            </strong>
            <span
              className="pill-dot"
              aria-hidden="true"
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#c5a77d",
                display: "inline-block",
              }}
            />
          </Link>
        </div>

        {total > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Następna realizacja"
            style={{
              background: "transparent",
              border: "none",
              color: "#8b704f",
              padding: "4px 6px",
              fontSize: "0.95rem",
              cursor: "pointer",
              lineHeight: 1,
              borderRadius: "2px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#171717")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8b704f")}
            title="Następna realizacja"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

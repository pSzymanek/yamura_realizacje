"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import type { ProjectListItem, ProjectDetails } from "@/lib/types";

type ActiveProjectContextType = {
  projects: (ProjectListItem | ProjectDetails)[];
  currentIndex: number;
  currentProject: (ProjectListItem | ProjectDetails) | null;
  total: number;
  fadeKey: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  goToNext: () => void;
  goToPrev: () => void;
  goToIndex: (index: number) => void;
};

const ActiveProjectContext = createContext<ActiveProjectContextType | null>(null);

export function ActiveProjectSyncProvider({
  projects,
  intervalMs = 10000,
  children,
}: {
  projects: (ProjectListItem | ProjectDetails)[];
  intervalMs?: number;
  children: React.ReactNode;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  const total = projects.length;

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
    setFadeKey((k) => k + 1);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    setFadeKey((k) => k + 1);
  }, [total]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setFadeKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
      setFadeKey((k) => k + 1);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [total, isPaused, intervalMs]);

  const currentProject = projects[currentIndex] || projects[0] || null;

  const value = useMemo(
    () => ({
      projects,
      currentIndex,
      currentProject,
      total,
      fadeKey,
      isPaused,
      setIsPaused,
      goToNext,
      goToPrev,
      goToIndex,
    }),
    [projects, currentIndex, currentProject, total, fadeKey, isPaused, goToNext, goToPrev, goToIndex],
  );

  return (
    <ActiveProjectContext.Provider value={value}>
      {children}
    </ActiveProjectContext.Provider>
  );
}

export function useActiveProjectSync() {
  return useContext(ActiveProjectContext);
}

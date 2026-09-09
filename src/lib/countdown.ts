import type { ProjectStatus } from "@/lib/statuses";

export type CountdownUrgency =
  | "normal"
  | "soon"
  | "today"
  | "overdue"
  | "completed"
  | "none";

export type CountdownResult = {
  days: number | null;
  label: string;
  badgeLabel: string;
  urgency: CountdownUrgency;
  isOverdue: boolean;
  formattedDate: string | null;
};

export function calculateStageCountdown(
  targetDate: string | null | undefined,
  status: ProjectStatus | string,
): CountdownResult {
  if (status === "completed") {
    return {
      days: 0,
      label: "Etap i realizacja ukończone",
      badgeLabel: "Zakończono",
      urgency: "completed",
      isOverdue: false,
      formattedDate: targetDate || null,
    };
  }

  if (!targetDate) {
    return {
      days: null,
      label: "Termin etapu w trakcie ustalania",
      badgeLabel: "W ustalaniu",
      urgency: "none",
      isOverdue: false,
      formattedDate: null,
    };
  }

  const parts = targetDate.split("T")[0].split("-");
  if (parts.length < 3) {
    return {
      days: null,
      label: "Termin nieokreślony",
      badgeLabel: "Brak terminu",
      urgency: "none",
      isOverdue: false,
      formattedDate: null,
    };
  }

  const target = new Date(
    Number.parseInt(parts[0], 10),
    Number.parseInt(parts[1], 10) - 1,
    Number.parseInt(parts[2], 10),
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffMs = target.getTime() - today.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = target.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (days < 0) {
    const absDays = Math.abs(days);
    const dayWord = absDays === 1 ? "dzień" : "dni";
    return {
      days,
      label: "Opóźnienie o " + absDays + " " + dayWord + " względem planu",
      badgeLabel: absDays + " " + dayWord + " po terminie",
      urgency: "overdue",
      isOverdue: true,
      formattedDate,
    };
  }

  if (days === 0) {
    return {
      days: 0,
      label: "Planowane ukończenie etapu dzisiaj",
      badgeLabel: "Dzisiaj",
      urgency: "today",
      isOverdue: false,
      formattedDate,
    };
  }

  if (days === 1) {
    return {
      days: 1,
      label: "Pozostał 1 dzień (jutro)",
      badgeLabel: "Jutro (1 dzień)",
      urgency: "soon",
      isOverdue: false,
      formattedDate,
    };
  }

  if (days <= 3) {
    return {
      days,
      label: "Pozostały " + days + " dni do ukończenia etapu",
      badgeLabel: days + " dni",
      urgency: "soon",
      isOverdue: false,
      formattedDate,
    };
  }

  return {
    days,
    label: "Pozostało " + days + " dni do ukończenia etapu",
    badgeLabel: days + " dni",
    urgency: "normal",
    isOverdue: false,
    formattedDate,
  };
}

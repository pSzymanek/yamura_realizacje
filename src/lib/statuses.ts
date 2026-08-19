export const PROJECT_STATUSES = [
  { value: "accepted", label: "Zamówienie przyjęte" },
  { value: "measurement", label: "Pomiar" },
  { value: "documentation", label: "Dokumentacja / projekt wykonawczy" },
  { value: "materials_ordered", label: "Zamówienie materiałów" },
  { value: "materials_ready", label: "Materiały skompletowane" },
  { value: "production", label: "Produkcja" },
  { value: "quality_control", label: "Kontrola jakości" },
  { value: "ready_for_installation", label: "Gotowe do montażu" },
  { value: "installation", label: "Montaż" },
  { value: "acceptance", label: "Odbiór" },
  { value: "completed", label: "Realizacja zakończona" },
  { value: "waiting_for_customer", label: "Oczekujemy na klienta" },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["value"];

export const STATUS_VALUES = PROJECT_STATUSES.map(({ value }) => value) as [
  ProjectStatus,
  ...ProjectStatus[],
];

export const STATUS_LABELS = Object.fromEntries(
  PROJECT_STATUSES.map(({ value, label }) => [value, label]),
) as Record<ProjectStatus, string>;

export const PROGRESS_STATUSES = PROJECT_STATUSES.filter(
  ({ value }) => value !== "waiting_for_customer",
);

export function isProjectStatus(value: string): value is ProjectStatus {
  return STATUS_VALUES.includes(value as ProjectStatus);
}

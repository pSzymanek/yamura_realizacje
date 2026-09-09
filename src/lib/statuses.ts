// Yamura Realizacje — Główne etapy i statusy realizacji

export const CORE_STAGES = [
  {
    id: "design",
    code: "01",
    label: "Projekt i Pomiary",
    shortLabel: "Projekt",
    description: "Inwentaryzacja, pomiary laserowe 3D i rysunki wykonawcze",
  },
  {
    id: "materials",
    code: "02",
    label: "Materiały i Przygotowanie",
    shortLabel: "Materiały",
    description: "Selekcja fornirów, kompletacja drewna, okucia i systemy meblowe",
  },
  {
    id: "production",
    code: "03",
    label: "Produkcja Stolarska",
    shortLabel: "Produkcja",
    description: "Precyzyjne cięcie, frezowanie, lakierowanie i próbny montaż w pracowni",
  },
  {
    id: "installation",
    code: "04",
    label: "Montaż u Klienta",
    shortLabel: "Montaż",
    description: "Dostawa zabezpieczonych elementów, montaż zabudowy i instalacja blatów",
  },
  {
    id: "completed",
    code: "05",
    label: "Odbiór i Zakończenie",
    shortLabel: "Zakończona",
    description: "Kontrola spasowania frontów, regulacja mechanizmów i protokół odbioru",
  },
] as const;

export type CoreStageId = (typeof CORE_STAGES)[number]["id"];

export const PROJECT_STATUSES = [
  { value: "inquiry", label: "Zapytanie ofertowe" },
  { value: "quote_preparing", label: "Przygotowanie wyceny" },
  { value: "quote_sent", label: "Wycena wysłana" },
  { value: "quote_accepted", label: "Wycena zaakceptowana" },
  { value: "contract", label: "Umowa" },
  { value: "design", label: "Projekt i Pomiary" },
  { value: "materials", label: "Materiały i Przygotowanie" },
  { value: "production", label: "Produkcja Stolarska" },
  { value: "installation", label: "Montaż u Klienta" },
  { value: "completed", label: "Realizacja Zakończona" },
  { value: "waiting_for_customer", label: "Oczekujemy na decyzję klienta" },
  // Zgodność wsteczna:
  { value: "accepted", label: "Projekt i Pomiary (Przyjęte)" },
  { value: "measurement", label: "Projekt i Pomiary (Pomiar)" },
  { value: "documentation", label: "Projekt i Pomiary (Dokumentacja)" },
  { value: "materials_ordered", label: "Materiały i Przygotowanie (Zamówione)" },
  { value: "materials_ready", label: "Materiały i Przygotowanie (Skompletowane)" },
  { value: "quality_control", label: "Produkcja Stolarska (Kontrola)" },
  { value: "ready_for_installation", label: "Produkcja Stolarska (Gotowe do montażu)" },
  { value: "acceptance", label: "Montaż u Klienta (Odbiór)" },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["value"];

export const STATUS_VALUES = PROJECT_STATUSES.map(({ value }) => value) as [
  ProjectStatus,
  ...ProjectStatus[],
];

export function getNormalizedStage(status: ProjectStatus | string): CoreStageId | null {
  switch (status) {
    case "inquiry":
    case "quote_preparing":
    case "quote_sent":
    case "quote_accepted":
    case "contract":
      return null; // Not part of the production pipeline yet
    case "design":
    case "accepted":
    case "measurement":
    case "documentation":
      return "design";
    case "materials":
    case "materials_ordered":
    case "materials_ready":
      return "materials";
    case "production":
    case "quality_control":
    case "ready_for_installation":
      return "production";
    case "installation":
    case "acceptance":
      return "installation";
    case "completed":
      return "completed";
    case "waiting_for_customer":
      return "design";
    default:
      return null;
  }
}

export const STATUS_LABELS: Record<string, string> = {
  inquiry: "Zapytanie ofertowe",
  quote_preparing: "Przygotowanie wyceny",
  quote_sent: "Wycena wysłana",
  quote_accepted: "Wycena zaakceptowana",
  contract: "Umowa",
  design: "Projekt i Pomiary",
  materials: "Materiały i Przygotowanie",
  production: "Produkcja Stolarska",
  installation: "Montaż u Klienta",
  completed: "Realizacja Zakończona",
  waiting_for_customer: "Oczekujemy na klienta",
  accepted: "Projekt i Pomiary",
  measurement: "Projekt i Pomiary",
  documentation: "Projekt i Pomiary",
  materials_ordered: "Materiały i Przygotowanie",
  materials_ready: "Materiały i Przygotowanie",
  quality_control: "Produkcja Stolarska",
  ready_for_installation: "Produkcja Stolarska",
  acceptance: "Montaż u Klienta",
};

export const PROGRESS_STATUSES = CORE_STAGES;

export function isProjectStatus(value: string): value is ProjectStatus {
  return STATUS_VALUES.includes(value as ProjectStatus);
}

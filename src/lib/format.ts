export function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatShortDate(value: string | null) {
  return formatDate(value, { month: "short" });
}

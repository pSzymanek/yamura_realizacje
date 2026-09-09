import { formatDate } from "@/lib/format";
import type { ProjectDetails } from "@/lib/types";

const paymentStatus = { planned: "Planowana", due: "Do zapłaty", paid: "Opłacona" } as const;

function money(value: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(value);
}

export function CustomerProjectSummary({ project }: { project: ProjectDetails }) {
  const upcoming = (project.appointments || []).find((item) => item.status === "scheduled");
  return <div className="customer-project-summary">
    {upcoming && <section><span className="customer-eyebrow">Najbliższy termin</span><h3>{upcoming.title}</h3><strong>{formatDate(upcoming.starts_at)}</strong><p>{upcoming.location}</p></section>}
    <section><span className="customer-eyebrow">Rozliczenia</span><h3>{(project.payments || []).length ? "Harmonogram płatności" : "Brak płatności"}</h3>{(project.payments || []).map((payment) => <div key={payment.id}><span>{payment.label} · {paymentStatus[payment.status]}</span><strong>{money(payment.amount)}</strong></div>)}</section>
    <section><span className="customer-eyebrow">Osoby w projekcie</span><h3>Twój zespół</h3>{(project.participants || []).filter((person) => person.access === "staff").map((person) => <div key={person.id}><span>{person.role}</span><strong>{person.name}</strong></div>)}</section>
    {project.warranty_until && <section><span className="customer-eyebrow">Opieka po realizacji</span><h3>Gwarancja aktywna</h3><strong>do {formatDate(project.warranty_until)}</strong><p>Zgłoszenie serwisowe możesz rozpocząć w zakładce Kontakt.</p></section>}
  </div>;
}

import { formatDate } from "@/lib/format";
import type { ProjectDetails } from "@/lib/types";

const quoteStatus = { draft: "Robocza", sent: "Wysłana", superseded: "Zastąpiona", accepted: "Zaakceptowana", rejected: "Odrzucona", expired: "Wygasła" } as const;
const paymentStatus = { planned: "Planowana", due: "Do zapłaty", paid: "Opłacona" } as const;
const appointmentStatus = { scheduled: "Zaplanowano", completed: "Zakończono", cancelled: "Odwołano" } as const;

function money(value: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(value);
}

export function ProjectOperations({ project }: { project: ProjectDetails }) {
  const completed = (project.checklist || []).filter((item) => item.completed).length;
  return <>
    <section className="project-command-bar" aria-label="Sterowanie projektem">
      <div><span>Następne działanie</span><strong>{project.next_action?.title || "Brak"}</strong><small>{project.next_action?.description || ""}</small></div>

      <div><span>Termin</span><strong>{project.next_action?.due_date ? formatDate(project.next_action.due_date) : "Brak"}</strong><small>{project.next_action?.status === "completed" ? "Zakończone" : project.next_action?.owner || "-"}</small></div>
      <div><span>Opiekun</span><strong>{project.owner_name}</strong><small>{project.priority === "high" ? "Priorytet wysoki" : "Priorytet standardowy"}</small></div>
      <button type="button" title="Funkcja demonstracyjna">Oznacz jako wykonane</button>
    </section>

    <div className="project-operations-grid">
      <section className="operations-card operations-card--wide">
        <div className="operations-card__heading"><div><span className="eyebrow">Historia handlowa</span><h3>Wersje wyceny</h3></div><button type="button">+ Nowa wersja</button></div>
        <div className="quote-version-list">{(project.quote_versions || []).map((quote) => <article key={quote.id}><div><strong>{quote.number} · v{quote.version}</strong><span>{quoteStatus[quote.status]}</span></div><b>{money(quote.amount_gross)}</b><small>ważna do {formatDate(quote.valid_until)}</small></article>)}{!(project.quote_versions || []).length && <p>Wycena nie została jeszcze przygotowana.</p>}</div>
      </section>

      <section className="operations-card">
        <div className="operations-card__heading"><div><span className="eyebrow">Odpowiedzialność</span><h3>Uczestnicy</h3></div><button type="button">+ Dodaj</button></div>
        <div className="participant-list">{(project.participants || []).map((person) => <article key={person.id}><i>{person.name.slice(0, 1)}</i><div><strong>{person.name}</strong><span>{person.role}</span><small>{person.email}</small></div></article>)}</div>
      </section>

      <section className="operations-card">
        <div className="operations-card__heading"><div><span className="eyebrow">Kontrola procesu</span><h3>Checklista</h3></div><b>{completed}/{(project.checklist || []).length}</b></div>
        <div className="operations-checklist">{(project.checklist || []).map((item) => <label key={item.id}><input type="checkbox" checked={item.completed} readOnly /><span>{item.label}</span></label>)}</div>
      </section>

      <section className="operations-card operations-card--wide">
        <div className="operations-card__heading"><div><span className="eyebrow">Plan pracy</span><h3>Terminy</h3></div><button type="button">+ Dodaj termin</button></div>
        <div className="appointment-list">{(project.appointments || []).map((appointment) => <article key={appointment.id}><time><strong>{formatDate(appointment.starts_at)}</strong><span>{new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.starts_at))}</span></time><div><strong>{appointment.title}</strong><span>{appointment.location}</span><small>{appointment.assigned_to} · {appointmentStatus[appointment.status]}</small></div></article>)}{!(project.appointments || []).length && <p>Brak zaplanowanych terminów.</p>}</div>
      </section>

      <section className="operations-card">
        <div className="operations-card__heading"><div><span className="eyebrow">Rozliczenia</span><h3>Płatności</h3></div></div>
        <div className="payment-list">{(project.payments || []).map((payment) => <article key={payment.id}><div><strong>{payment.label}</strong><span>{paymentStatus[payment.status]} · {formatDate(payment.due_date)}</span></div><b>{money(payment.amount)}</b></article>)}{!(project.payments || []).length && <p>Brak harmonogramu płatności.</p>}</div>
        {project.warranty_until && <div className="warranty-note"><span>Gwarancja</span><strong>do {formatDate(project.warranty_until)}</strong></div>}
      </section>

      <section className="operations-card operations-card--wide">
        <div className="operations-card__heading"><div><span className="eyebrow">Dla zespołu</span><h3>Notatki wewnętrzne</h3></div><b>Niewidoczne dla klienta</b></div>
        <div className="internal-notes-list">{(project.internal_notes || []).map((note, idx) => <article key={idx}><time>{formatDate(note.created_at)}</time><div><strong>{note.author}</strong><p>{note.body}</p></div></article>)}{!(project.internal_notes || []).length && <p>Brak notatek.</p>}</div>
      </section>
    </div>
  </>;
}

import Link from "next/link";

import { CustomerPageHeading } from "@/components/customer-page-heading";
import { StatusBadge } from "@/components/status-badge";
import { StageCountdown } from "@/components/stage-countdown";
import { getCustomerProjects } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default async function CustomerProjectsPage() {
  const projects = await getCustomerProjects();
  const active = projects.filter((project) => project.status !== "completed");
  const completed = projects.filter((project) => project.status === "completed");

  return (
    <main className="customer-content">
      <CustomerPageHeading
        eyebrow="Twoja współpraca z YAMURA"
        title="Realizacje"
        description="Aktualny przebieg prac, historia oraz dokumenty przypisane do Twojego konta."
      />

      <section className="customer-project-section">
        <div className="customer-section-title"><div><span className="customer-eyebrow">W toku</span><h2>Aktualne realizacje</h2></div><b>{active.length}</b></div>
        <div className="customer-project-list">
          {active.map((project) => (
            <Link href={`/konto/realizacje/${project.id}`} className="customer-project-card" key={project.id}>
              <div className="customer-project-card__index">Y</div>
              <div className="customer-project-card__main"><span>{project.order_number}</span><h3>{project.title}</h3><p>Ostatnia aktualizacja: {formatDate(project.updated_at)}</p></div>
              <div className="customer-project-card__status">
                <StageCountdown targetDate={project.next_step_date} status={project.status} variant="badge" />
                <StatusBadge status={project.status} />
                <span>{project.next_step || "Szczegóły realizacji"} →</span>
              </div>
            </Link>
          ))}
          {!active.length && <div className="customer-empty-state"><h3>Brak realizacji w toku</h3><p>Nowy projekt pojawi się tu po przypisaniu go do Twojego adresu e-mail.</p></div>}
        </div>
      </section>

      <section className="customer-project-section customer-project-section--history">
        <div className="customer-section-title"><div><span className="customer-eyebrow">Archiwum</span><h2>Historia realizacji</h2></div><b>{completed.length}</b></div>
        <div className="customer-project-list">
          {completed.map((project) => (
            <Link href={`/konto/realizacje/${project.id}`} className="customer-project-card customer-project-card--completed" key={project.id}>
              <div className="customer-project-card__index">✓</div>
              <div className="customer-project-card__main"><span>{project.order_number}</span><h3>{project.title}</h3><p>Zakończono · dokumentacja dostępna</p></div>
              <div className="customer-project-card__status"><StatusBadge status={project.status} /><span>Otwórz archiwum →</span></div>
            </Link>
          ))}
          {!completed.length && <div className="customer-empty-state"><h3>Historia jest jeszcze pusta</h3><p>Zakończone projekty wraz z dokumentami zostaną zachowane w tym miejscu.</p></div>}
        </div>
      </section>
    </main>
  );
}

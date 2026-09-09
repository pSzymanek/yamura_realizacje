import Link from "next/link";

import { getProjects } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { PROJECT_STATUSES } from "@/lib/statuses";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const projects = await getProjects();
  
  const openActions = projects.filter((project) => false); // Mocking for now as next_action doesn't exist on real type yet
  const scheduled = []; // Mocking appointments
  const activeRealizations = projects.filter((project) => project.status !== "completed" && project.status !== "inquiry" && project.status !== "quote_preparing" && project.status !== "quote_sent" && project.status !== "quote_accepted");
  const completed = projects.filter((project) => project.status === "completed");
  const quotesWaiting = projects.filter((project) => project.status === "quote_sent");
  const recentEvents = []; // Mocking events

  return <main className="panel-content">
    <div className="page-heading"><div><span className="eyebrow">Centrum pracy</span><h1>Dzień dobry</h1><p>Najważniejsze działania, terminy i decyzje dla wszystkich projektów YMR.</p></div><Link className="button button--primary" href="/panel/nowa">+ Nowy projekt</Link></div>
    <section className="admin-dashboard-stats" aria-label="Podsumowanie pracy">
      <Link href="/panel/realizacje"><span>Wszystkie projekty</span><strong>{projects.length}</strong><small>pełny lejek YMR</small></Link>
      <Link href="/panel/realizacje?status=quote_sent"><span>Czekają na klienta</span><strong>{quotesWaiting.length}</strong><small>wysłane wyceny</small></Link>
      <Link href="/panel/realizacje"><span>Aktywne realizacje</span><strong>{activeRealizations.length}</strong><small>po akceptacji</small></Link>
      <Link href="/panel/realizacje?status=completed"><span>Zakończone</span><strong>{completed.length}</strong><small>w archiwum</small></Link>
    </section>
  </main>;
}

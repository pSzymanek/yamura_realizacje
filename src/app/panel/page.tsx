import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { getProjects } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { isProjectStatus, PROJECT_STATUSES } from "@/lib/statuses";

export const dynamic = "force-dynamic";

export default async function PanelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const [projects, params] = await Promise.all([getProjects(), searchParams]);
  const query = (params.q || "").trim().toLocaleLowerCase("pl");
  const status = params.status && isProjectStatus(params.status) ? params.status : "";
  const filtered = projects.filter((project) => {
    const matchesQuery =
      !query ||
      project.order_number.toLocaleLowerCase("pl").includes(query) ||
      project.customer_name.toLocaleLowerCase("pl").includes(query);
    return matchesQuery && (!status || project.status === status);
  });

  return (
    <main className="panel-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Panel pracownika</span>
          <h1>Realizacje</h1>
          <p>{projects.length} {projects.length === 1 ? "realizacja" : "realizacji"} w systemie</p>
        </div>
        <Link className="button button--primary desktop-only" href="/panel/nowa">
          Nowa realizacja
        </Link>
      </div>

      <form className="filters" method="get">
        <div className="field field--search">
          <label className="sr-only" htmlFor="q">Szukaj</label>
          <input
            id="q"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Numer zamówienia lub klient…"
          />
        </div>
        <div className="field">
          <label className="sr-only" htmlFor="filterStatus">Status</label>
          <select id="filterStatus" name="status" defaultValue={status}>
            <option value="">Wszystkie statusy</option>
            {PROJECT_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <button className="button button--secondary" type="submit">Filtruj</button>
        {(query || status) && <Link className="filters__clear" href="/panel">Wyczyść</Link>}
      </form>

      <div className="projects-table-wrap">
        {filtered.length ? (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Realizacja</th>
                <th>Klient</th>
                <th>Status</th>
                <th>Następny krok</th>
                <th>Aktualizacja</th>
                <th><span className="sr-only">Otwórz</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id}>
                  <td data-label="Realizacja">
                    <strong>{project.order_number}</strong>
                    <span>{project.title}</span>
                  </td>
                  <td data-label="Klient">{project.customer_name}</td>
                  <td data-label="Status"><StatusBadge status={project.status} /></td>
                  <td data-label="Następny krok">{project.next_step || "—"}</td>
                  <td data-label="Aktualizacja">{formatShortDate(project.updated_at)}</td>
                  <td><Link className="row-link" href={`/panel/realizacje/${project.id}`}>Otwórz</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h2>Brak pasujących realizacji</h2>
            <p>Zmień filtry albo utwórz pierwszą realizację.</p>
          </div>
        )}
      </div>
    </main>
  );
}

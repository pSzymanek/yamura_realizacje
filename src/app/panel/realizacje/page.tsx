import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { StageCountdown } from "@/components/stage-countdown";
import { getProjects } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { isProjectStatus, PROJECT_STATUSES, CORE_STAGES } from "@/lib/statuses";

export const dynamic = "force-dynamic";

export default async function RealizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; type?: string }>;
}) {
  const [projects, params] = await Promise.all([getProjects(), searchParams]);
  const query = (params.q || "").trim().toLocaleLowerCase("pl");
  const status = params.status && isProjectStatus(params.status) ? params.status : "";
  const typeFilter = params.type || "";

  const filtered = projects.filter((project) => {
    const matchesQuery =
      !query ||
      [project.order_number, project.title, project.customer_name, project.customer_email, project.next_step].some(
        (value) => value?.toLocaleLowerCase("pl").includes(query),
      );
    const matchesStatus = !status || project.status === status;
    const matchesType =
      !typeFilter ||
      (typeFilter === "internal" && project.is_internal) ||
      (typeFilter === "client" && !project.is_internal);

    return matchesQuery && matchesStatus && matchesType;
  });

  return (
    <main className="panel-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Pracownia Stolarska Yamura</span>
          <h1>Dziennik Realizacji</h1>
          <p>
            {projects.length} {projects.length === 1 ? "realizacja" : "realizacji"} w toku
            · {projects.filter((p) => !p.is_internal).length} z klientem
            · {projects.filter((p) => p.is_internal).length} wewnętrznych
          </p>
        </div>
        <Link className="button button--primary desktop-only" href="/panel/nowa">
          + Nowa realizacja
        </Link>
      </div>

      <form className="filters" method="get">
        <div className="field field--search">
          <label className="sr-only" htmlFor="q">
            Szukaj
          </label>
          <input
            id="q"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Numer YMR, nazwa, klient, e-mail lub kolejny krok…"
          />
        </div>

        <div className="field">
          <label className="sr-only" htmlFor="filterStatus">
            Etap
          </label>
          <select id="filterStatus" name="status" defaultValue={status}>
            <option value="">Wszystkie etapy</option>
            {CORE_STAGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.code}. {item.label}
              </option>
            ))}
            <option value="waiting_for_customer">Oczekujemy na klienta</option>
          </select>
        </div>

        <div className="field">
          <label className="sr-only" htmlFor="filterType">
            Typ
          </label>
          <select id="filterType" name="type" defaultValue={typeFilter}>
            <option value="">Wszystkie typy</option>
            <option value="client">Tylko z klientem</option>
            <option value="internal">Tylko wewnętrzne (pracownia)</option>
          </select>
        </div>

        <button className="button button--secondary" type="submit">
          Filtruj
        </button>
        {(query || status || typeFilter) && (
          <Link className="filters__clear" href="/panel/realizacje">
            Wyczyść
          </Link>
        )}
      </form>

      <div className="projects-table-wrap">
        {filtered.length ? (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Projekt</th>
                <th>Typ / Klient</th>
                <th>Etap</th>
                <th>Termin etapu</th>
                <th>Następny krok</th>
                <th>Aktualizacja</th>
                <th>
                  <span className="sr-only">Otwórz</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => (
                <tr key={project.id}>
                  <td data-label="Projekt">
                    <strong>{project.order_number}</strong>
                    <span>{project.title}</span>
                  </td>
                  <td data-label="Klient">
                    {project.is_internal ? (
                      <span className="internal-badge">Pracownia</span>
                    ) : (
                      <span>{project.customer_name || "—"}</span>
                    )}
                  </td>
                  <td data-label="Etap">
                    <StatusBadge status={project.status} />
                  </td>
                  <td data-label="Termin etapu">
                    <StageCountdown
                      targetDate={project.next_step_date}
                      status={project.status}
                      variant="badge"
                    />
                  </td>
                  <td data-label="Następny krok">{project.next_step || "—"}</td>
                  <td data-label="Aktualizacja">{formatShortDate(project.updated_at)}</td>
                  <td>
                    <Link className="row-link" href={`/panel/realizacje/${project.id}`}>
                      Otwórz →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h2>Brak pasujących realizacji</h2>
            <p>Zmień filtry albo wróć do wszystkich projektów.</p>
          </div>
        )}
      </div>
    </main>
  );
}

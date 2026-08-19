import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyLinkButton } from "@/components/copy-link-button";
import { ProjectDetailsForm } from "@/components/project-details-form";
import { StatusBadge } from "@/components/status-badge";
import { UpdateForm } from "@/components/update-form";
import { UpdatesList } from "@/components/updates-list";
import { getStaffProject } from "@/lib/data";
import { getAppUrl } from "@/lib/env";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const project = await getStaffProject(id);
  if (!project) notFound();
  const clientLink = `${getAppUrl()}/r/${project.access_token}`;
  const wasCreated = query.created === "1";

  return (
    <main className="panel-content">
      <Link className="back-link" href="/panel">← Wszystkie realizacje</Link>
      {wasCreated && (
        <div className="success-banner" role="status">
          <div>
            <strong>Realizacja została utworzona.</strong>
            <span>Skopiuj prywatny link i przekaż go klientowi bezpiecznym kanałem.</span>
          </div>
          <CopyLinkButton link={clientLink} />
        </div>
      )}
      <div className="project-heading">
        <div>
          <span className="eyebrow">{project.order_number}</span>
          <h1>{project.title}</h1>
          <p>{project.customer_name} · {project.customer_email}</p>
        </div>
        <div className="project-heading__actions">
          <StatusBadge status={project.status} />
          <CopyLinkButton link={clientLink} />
        </div>
      </div>

      <section className="summary-grid" aria-label="Podsumowanie realizacji">
        <div className="summary-card">
          <span>Następny krok</span>
          <strong>{project.next_step || "Nie określono"}</strong>
        </div>
        <div className="summary-card">
          <span>Orientacyjna data</span>
          <strong>{formatDate(project.next_step_date)}</strong>
        </div>
        <div className="summary-card">
          <span>Ostatnia zmiana</span>
          <strong>{formatDate(project.updated_at)}</strong>
        </div>
      </section>

      <div className="panel-detail-grid">
        <div className="stack stack--section">
          <UpdateForm project={project} />
          <section className="card history-card">
            <div className="section-heading section-heading--compact">
              <div>
                <span className="eyebrow">Historia</span>
                <h2>Dziennik realizacji</h2>
              </div>
              <span>{project.updates.length} wpisów</span>
            </div>
            <UpdatesList updates={project.updates} />
          </section>
        </div>
        <aside>
          <details className="card details-editor">
            <summary>Edytuj dane realizacji</summary>
            <ProjectDetailsForm project={project} />
          </details>
          <div className="card private-link-card">
            <span className="eyebrow">Prywatny link</span>
            <p>Każda osoba posiadająca ten link zobaczy dziennik tej realizacji.</p>
            <code>{clientLink}</code>
            <CopyLinkButton link={clientLink} />
          </div>
        </aside>
      </div>
    </main>
  );
}

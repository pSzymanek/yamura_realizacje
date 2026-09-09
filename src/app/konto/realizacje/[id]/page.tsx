import Link from "next/link";
import { notFound } from "next/navigation";

import { AttachmentGallery } from "@/components/attachment-gallery";
import { CustomerPageHeading } from "@/components/customer-page-heading";
import { ProgressTimeline } from "@/components/progress-timeline";
import { StatusBadge } from "@/components/status-badge";
import { getCustomerProject } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default async function CustomerProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getCustomerProject(id);
  if (!project) notFound();

  return (
    <main className="customer-content">
      <Link href="/konto/realizacje" className="customer-back-link">
        ← Wszystkie realizacje
      </Link>

      <CustomerPageHeading
        eyebrow={project.order_number}
        title={project.title}
        description="Prywatny dziennik przebiegu prac stolarskich, osi czasu i dokumentacji zamówienia."
        aside={<StatusBadge status={project.status} />}
      />

      <section className="customer-order-strip" aria-label="Parametry realizacji">
        <div>
          <span>Bieżące działanie</span>
          <strong>{project.next_step || "W trakcie przygotowania"}</strong>
        </div>
        <div>
          <span>Planowany termin etapu</span>
          <strong>{project.next_step_date ? formatDate(project.next_step_date) : "Do potwierdzenia"}</strong>
        </div>
        <div>
          <span>Ostatnia zmiana w pracowni</span>
          <strong>{formatDate(project.updated_at)}</strong>
        </div>
      </section>

      {/* Progress Timeline */}
      <section className="customer-surface" style={{ marginBottom: "36px" }}>
        <div className="section-header-clean">
          <span className="customer-eyebrow">Przebieg realizacji</span>
          <h2>Oś czasu realizacji</h2>
          <p>
            Wybierz aktywny etap, aby zobaczyć szczegółowe podetapy, notatki technologiczne i fotografie z procesu obróbki.
          </p>
        </div>
        <ProgressTimeline currentStatus={project.status} updates={project.updates} />
      </section>

      {/* Documents & Journal Section */}
      <div className="customer-two-column-clean">
        {/* Left column: Journal */}
        <section className="customer-surface">
          <div className="customer-section-title">
            <div>
              <span className="customer-eyebrow">Dziennik pracowni</span>
              <h2>Wpisy z realizacji</h2>
            </div>
            <b>{project.updates.length}</b>
          </div>

          <div className="customer-update-list">
            {project.updates.map((update) => (
              <article key={update.id}>
                <div className="customer-update-list__date">
                  <strong>
                    {new Intl.DateTimeFormat("pl-PL", { day: "2-digit" }).format(
                      new Date(update.created_at),
                    )}
                  </strong>
                  <span>
                    {new Intl.DateTimeFormat("pl-PL", {
                      month: "short",
                      year: "numeric",
                    }).format(new Date(update.created_at))}
                  </span>
                </div>
                <div>
                  <span className="customer-eyebrow">Wpis w dzienniku</span>
                  <h3>{update.title}</h3>
                  <p>{update.description}</p>
                  <AttachmentGallery attachments={update.attachments} />
                </div>
              </article>
            ))}
            {!project.updates.length && (
              <div className="customer-empty-state">
                <h3>Dziennik czeka na pierwszy wpis</h3>
                <p>Mistrz stolarki opublikuje tu notatki i fotografie z postępów prac.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right column: Documents */}
        <aside className="customer-surface customer-documents">
          <div className="customer-section-title">
            <div>
              <span className="customer-eyebrow">Teczka projektu</span>
              <h2>Dokumentacja</h2>
            </div>
          </div>
          <p style={{ margin: "6px 0 20px", color: "var(--muted, #666)", fontSize: "0.85rem" }}>
            Zestawienie dokumentów formalnych i technicznych powiązanych z zamówieniem {project.order_number}.
          </p>
          {(project.documents || []).map((doc) => (
            <button type="button" key={doc.id}>
              <i>PDF</i>
              <span>
                <strong>{doc.name}</strong>
                <small>{doc.number} · {doc.status}</small>
              </span>
              <b>↓</b>
            </button>
          ))}
          {!(project.documents || []).length && (
            <p className="customer-documents__note">Brak dokumentów w teczce.</p>
          )}
        </aside>
      </div>
    </main>
  );
}

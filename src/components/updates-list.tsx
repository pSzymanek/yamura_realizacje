import { AttachmentGallery } from "@/components/attachment-gallery";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/format";
import type { ProjectUpdate } from "@/lib/types";

export function UpdatesList({
  updates,
  variant = "panel",
}: {
  updates: ProjectUpdate[];
  variant?: "panel" | "client";
}) {
  if (!updates.length) {
    return (
      <div className="empty-state empty-state--updates">
        <h3>Jeszcze bez wpisów</h3>
        <p>Pierwsza opublikowana aktualizacja pojawi się w tym miejscu.</p>
      </div>
    );
  }

  return (
    <div className={`updates-list updates-list--${variant}`}>
      {updates.map((update) => (
        <article className="update-entry" key={update.id}>
          <div className="update-entry__marker" aria-hidden="true" />
          <div className="update-entry__content">
            <time dateTime={update.created_at}>{formatDate(update.created_at)}</time>
            <div className="update-entry__heading">
              <h3>{update.title}</h3>
              {update.status && <StatusBadge status={update.status} />}
            </div>
            <p>{update.description}</p>
            <AttachmentGallery attachments={update.attachments} />
          </div>
        </article>
      ))}
    </div>
  );
}

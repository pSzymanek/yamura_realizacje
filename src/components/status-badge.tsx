import { STATUS_LABELS, type ProjectStatus } from "@/lib/statuses";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}

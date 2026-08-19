import {
  PROGRESS_STATUSES,
  STATUS_LABELS,
  type ProjectStatus,
} from "@/lib/statuses";
import type { ProjectUpdate } from "@/lib/types";

export function ProgressTimeline({
  currentStatus,
  updates,
}: {
  currentStatus: ProjectStatus;
  updates: ProjectUpdate[];
}) {
  const recorded = new Set(
    updates.map((update) => update.status).filter((status): status is ProjectStatus => !!status),
  );
  recorded.add(currentStatus);

  return (
    <div className="progress-timeline">
      {PROGRESS_STATUSES.map((status, index) => {
        const isCurrent = currentStatus === status.value;
        const isRecorded = recorded.has(status.value);
        return (
          <div
            className={`progress-step${isCurrent ? " progress-step--current" : ""}${isRecorded ? " progress-step--recorded" : ""}`}
            key={status.value}
          >
            <span className="progress-step__number">{String(index + 1).padStart(2, "0")}</span>
            <span className="progress-step__dot" aria-hidden="true" />
            <span className="progress-step__label">{status.label}</span>
            {isCurrent && <span className="sr-only"> — aktualny etap</span>}
          </div>
        );
      })}
      {currentStatus === "waiting_for_customer" && (
        <div className="progress-waiting">
          <span>Aktualny stan</span>
          <strong>{STATUS_LABELS.waiting_for_customer}</strong>
        </div>
      )}
    </div>
  );
}

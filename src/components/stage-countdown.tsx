import type { ProjectStatus } from "@/lib/statuses";
import { calculateStageCountdown } from "@/lib/countdown";

type StageCountdownProps = {
  targetDate: string | null | undefined;
  status: ProjectStatus | string;
  stageName?: string;
  variant?: "badge" | "card" | "inline";
  className?: string;
};

export function StageCountdown({
  targetDate,
  status,
  stageName,
  variant = "badge",
  className = "",
}: StageCountdownProps) {
  const result = calculateStageCountdown(targetDate, status);

  if (variant === "badge") {
    return (
      <span
        className={"stage-countdown-badge stage-countdown-badge--" + result.urgency + " " + className}
        title={result.label}
      >
        <span className="stage-countdown-badge__dot" aria-hidden="true" />
        <span className="stage-countdown-badge__text">{result.badgeLabel}</span>
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <span
        className={"stage-countdown-inline stage-countdown-inline--" + result.urgency + " " + className}
      >
        <span className="stage-countdown-inline__dot" aria-hidden="true" />
        <span>{result.label}</span>
      </span>
    );
  }

  return (
    <div
      className={"stage-countdown-card stage-countdown-card--" + result.urgency + " " + className}
      role="region"
      aria-label="Licznik czasu etapu"
    >
      <div className="stage-countdown-card__header">
        <span className="eyebrow">Bieżący etap</span>
        {result.formattedDate && (
          <span className="stage-countdown-card__date">
            Termin: <strong>{result.formattedDate}</strong>
          </span>
        )}
      </div>

      <div className="stage-countdown-card__body">
        <div className="stage-countdown-card__number-wrap">
          {result.days !== null ? (
            <>
              <span className="stage-countdown-card__number">
                {result.days < 0 ? Math.abs(result.days) : result.days}
              </span>
              <span className="stage-countdown-card__unit">
                {Math.abs(result.days) === 1 ? "dzień" : "dni"}
              </span>
            </>
          ) : (
            <span className="stage-countdown-card__number stage-countdown-card__number--pending">
              —
            </span>
          )}
        </div>

        <div className="stage-countdown-card__info">
          <strong className="stage-countdown-card__title">
            {stageName ? stageName : "Bieżący etap realizacji"}
          </strong>
          <p className="stage-countdown-card__label">{result.label}</p>
        </div>
      </div>

      {result.urgency === "overdue" && (
        <div className="stage-countdown-card__alert">
          <span>Przekroczono planowany termin etapu. Sprawdź dziennik prac.</span>
        </div>
      )}
    </div>
  );
}

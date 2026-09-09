"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { DemoAppointment } from "@/lib/types";

type CalendarView = "day" | "week" | "month";

type CalendarAppointment = DemoAppointment & {
  project_number: string;
  project_name: string;
  customer_name: string;
  project_id: string;
};

const appointmentType = {
  consultation: "Konsultacja",
  measurement: "Pomiar",
  installation: "Montaż",
  acceptance: "Odbiór",
} as const;

const viewLabels: Record<CalendarView, string> = { day: "Dzień", week: "Tydzień", month: "Miesiąc" };
const weekdays = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const hours = Array.from({ length: 13 }, (_, index) => index + 7);
const demoToday = new Date(2026, 8, 4, 12);

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  result.setHours(12, 0, 0, 0);
  return result;
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function sameDay(first: Date, second: Date) {
  return dateKey(first) === dateKey(second);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);
}

function getMonthCells(cursor: Date) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const gridStart = addDays(first, -((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

type PositionedAppointment = {
  appointment: CalendarAppointment;
  style: React.CSSProperties;
  isNarrow: boolean;
};

function computeDayLayout(dayAppointments: CalendarAppointment[]): PositionedAppointment[] {
  if (!dayAppointments.length) return [];

  const items = dayAppointments.map((appointment) => {
    const d = new Date(appointment.starts_at);
    const startMin = (d.getHours() - 7) * 60 + d.getMinutes();
    const duration = Math.max(30, appointment.duration_minutes || 60);
    const endMin = startMin + duration;
    const top = Math.max(0, (startMin / 60) * 64);
    const height = Math.max(38, Math.min((duration / 60) * 64, 13 * 64 - top));
    return {
      appointment,
      startMin,
      endMin,
      top,
      height,
    };
  });

  items.sort((a, b) => a.startMin - b.startMin || (b.endMin - b.startMin) - (a.endMin - a.startMin));

  const clusters: typeof items[] = [];
  let currentCluster: typeof items = [];
  let clusterEnd = -1;

  for (const item of items) {
    if (currentCluster.length === 0) {
      currentCluster.push(item);
      clusterEnd = item.endMin;
    } else if (item.startMin < clusterEnd) {
      currentCluster.push(item);
      clusterEnd = Math.max(clusterEnd, item.endMin);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      clusterEnd = item.endMin;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const result: PositionedAppointment[] = [];

  for (const cluster of clusters) {
    const columns: number[] = [];
    const clusterPlaced: Array<{ item: (typeof items)[0]; col: number }> = [];

    for (const item of cluster) {
      let placedCol = -1;
      for (let c = 0; c < columns.length; c++) {
        if (item.startMin >= columns[c]) {
          placedCol = c;
          columns[c] = item.endMin;
          break;
        }
      }
      if (placedCol === -1) {
        placedCol = columns.length;
        columns.push(item.endMin);
      }
      clusterPlaced.push({ item, col: placedCol });
    }

    const numCols = columns.length;

    for (const { item, col } of clusterPlaced) {
      const leftPercent = (col / numCols) * 100;
      const widthPercent = (1 / numCols) * 100;
      result.push({
        appointment: item.appointment,
        isNarrow: numCols > 2,
        style: {
          top: `${item.top}px`,
          height: `${item.height}px`,
          left: numCols === 1 ? "4px" : `calc(2px + ${leftPercent}%)`,
          width: numCols === 1 ? "calc(100% - 8px)" : `calc(${widthPercent}% - 4px)`,
          zIndex: col + 1,
        },
      });
    }
  }

  return result;
}

function CalendarEventButton({
  appointment,
  compact = false,
  isNarrow = false,
  onSelect,
}: {
  appointment: CalendarAppointment;
  compact?: boolean;
  isNarrow?: boolean;
  onSelect: (appointment: CalendarAppointment) => void;
}) {
  const startsAt = new Date(appointment.starts_at);
  return (
    <button
      type="button"
      className={`visual-calendar-event visual-calendar-event--${appointment.type}${
        appointment.status === "completed" ? " is-completed" : ""
      }${compact ? " is-compact" : ""}${isNarrow ? " is-narrow" : ""}`}
      onClick={() => onSelect(appointment)}
      title={`${appointment.title}, ${formatTime(startsAt)}, ${appointment.customer_name}`}
    >
      <span>{formatTime(startsAt)}</span>
      <strong>{appointment.title}</strong>
      {!compact && !isNarrow && (
        <small>
          {appointment.project_number} · {appointment.customer_name}
        </small>
      )}
    </button>
  );
}

export function VisualCalendar({ appointments }: { appointments: CalendarAppointment[] }) {
  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState(demoToday);
  const [selected, setSelected] = useState<CalendarAppointment | null>(null);

  const monthCells = useMemo(() => getMonthCells(cursor), [cursor]);
  const weekDays = useMemo(() => {
    const first = startOfWeek(cursor);
    return Array.from({ length: 7 }, (_, index) => addDays(first, index));
  }, [cursor]);
  const appointmentsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarAppointment[]>();
    appointments.forEach((appointment) => {
      const key = dateKey(new Date(appointment.starts_at));
      grouped.set(key, [...(grouped.get(key) || []), appointment]);
    });
    return grouped;
  }, [appointments]);

  const periodLabel = view === "month"
    ? new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(cursor)
    : view === "week"
      ? `${new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short" }).format(weekDays[0])} – ${new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", year: "numeric" }).format(weekDays[6])}`
      : formatLongDate(cursor);
  const upcoming = appointments.filter((appointment) => new Date(appointment.starts_at) >= demoToday && appointment.status === "scheduled").slice(0, 4);

  function movePeriod(direction: -1 | 1) {
    const next = new Date(cursor);
    if (view === "month") next.setMonth(next.getMonth() + direction);
    if (view === "week") next.setDate(next.getDate() + 7 * direction);
    if (view === "day") next.setDate(next.getDate() + direction);
    setCursor(next);
    setSelected(null);
  }

  function openDay(day: Date) {
    setCursor(day);
    setView("day");
    setSelected(null);
  }

  return (
    <div className="visual-calendar-shell">
      <div className="calendar-toolbar">
        <button className="calendar-today" type="button" onClick={() => { setCursor(demoToday); setSelected(null); }}>Dzisiaj</button>
        <div className="calendar-navigation">
          <button type="button" onClick={() => movePeriod(-1)} aria-label="Poprzedni okres">←</button>
          <button type="button" onClick={() => movePeriod(1)} aria-label="Następny okres">→</button>
        </div>
        <strong>{periodLabel}</strong>
        <div className="calendar-view-switch" aria-label="Widok kalendarza">
          {(Object.keys(viewLabels) as CalendarView[]).map((item) => <button type="button" key={item} className={view === item ? "is-active" : ""} onClick={() => { setView(item); setSelected(null); }}>{viewLabels[item]}</button>)}
        </div>
      </div>

      <div className="visual-calendar-layout">
        <section className="visual-calendar" aria-label={`Kalendarz: ${periodLabel}`}>
          {view === "month" && <div className="calendar-month">
            <div className="calendar-month__weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
            <div className="calendar-month__grid">{monthCells.map((day) => {
              const dayAppointments = appointmentsByDay.get(dateKey(day)) || [];
              return <article key={dateKey(day)} className={`${day.getMonth() !== cursor.getMonth() ? "is-outside" : ""}${sameDay(day, demoToday) ? " is-today" : ""}`}>
                <button className="calendar-day-number" type="button" onClick={() => openDay(day)} aria-label={`Otwórz dzień ${formatLongDate(day)}`}>{day.getDate()}</button>
                <div>{dayAppointments.slice(0, 3).map((appointment) => <CalendarEventButton key={appointment.id} appointment={appointment} compact onSelect={setSelected} />)}</div>
                {dayAppointments.length > 3 && <button className="calendar-more" type="button" onClick={() => openDay(day)}>+{dayAppointments.length - 3} więcej</button>}
              </article>;
            })}</div>
          </div>}

          {view === "week" && <div className="calendar-timetable calendar-timetable--week">
            <div className="calendar-timetable__header"><span>Czas</span>{weekDays.map((day) => <button type="button" key={dateKey(day)} className={sameDay(day, demoToday) ? "is-today" : ""} onClick={() => openDay(day)}><small>{weekdays[(day.getDay() + 6) % 7]}</small><strong>{day.getDate()}</strong></button>)}</div>
            <div className="calendar-timetable__body">
              <div className="calendar-time-axis">{hours.map((hour) => <span key={hour}>{String(hour).padStart(2, "0")}:00</span>)}</div>
              {weekDays.map((day) => (
                <div className="calendar-time-column" key={dateKey(day)}>
                  {computeDayLayout(appointmentsByDay.get(dateKey(day)) || []).map(({ appointment, style, isNarrow }) => (
                    <div className="calendar-positioned-event" style={style} key={appointment.id}>
                      <CalendarEventButton appointment={appointment} isNarrow={isNarrow} onSelect={setSelected} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>}

          {view === "day" && <div className="calendar-timetable calendar-timetable--day">
            <div className="calendar-timetable__header"><span>Czas</span><button type="button" className={sameDay(cursor, demoToday) ? "is-today" : ""}><small>{new Intl.DateTimeFormat("pl-PL", { weekday: "long" }).format(cursor)}</small><strong>{cursor.getDate()}</strong></button></div>
            <div className="calendar-timetable__body">
              <div className="calendar-time-axis">{hours.map((hour) => <span key={hour}>{String(hour).padStart(2, "0")}:00</span>)}</div>
              <div className="calendar-time-column">
                {computeDayLayout(appointmentsByDay.get(dateKey(cursor)) || []).map(({ appointment, style, isNarrow }) => (
                  <div className="calendar-positioned-event" style={style} key={appointment.id}>
                    <CalendarEventButton appointment={appointment} isNarrow={isNarrow} onSelect={setSelected} />
                  </div>
                ))}
              </div>
            </div>
          </div>}
        </section>

        <aside className="calendar-details">
          {selected ? <>
            <button className="calendar-details__close" type="button" onClick={() => setSelected(null)} aria-label="Zamknij szczegóły">×</button>
            <span className="eyebrow">{appointmentType[selected.type]}</span>
            <h2>{selected.title}</h2>
            <div><span>Termin</span><strong>{formatLongDate(new Date(selected.starts_at))}<br />{formatTime(new Date(selected.starts_at))} · {selected.duration_minutes} min</strong></div>
            <div><span>Projekt</span><strong>{selected.project_number}<br />{selected.project_name}</strong></div>
            <div><span>Klient</span><strong>{selected.customer_name}</strong></div>
            <div><span>Miejsce</span><strong>{selected.location}</strong></div>
            <div><span>Przypisano</span><strong>{selected.assigned_to}</strong></div>
            <Link href={`/panel/realizacje/${selected.project_id}`}>Otwórz projekt <b>→</b></Link>
          </> : <>
            <span className="eyebrow">Najbliższe terminy</span>
            <h2>Plan zespołu</h2>
            <p>Kliknij wydarzenie w kalendarzu, aby zobaczyć klienta, miejsce i powiązany projekt.</p>
            <div className="calendar-upcoming-list">{upcoming.map((appointment) => <button type="button" key={appointment.id} onClick={() => { setCursor(new Date(appointment.starts_at)); setSelected(appointment); }}><time>{new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "short" }).format(new Date(appointment.starts_at))}</time><span><strong>{appointment.title}</strong><small>{formatTime(new Date(appointment.starts_at))} · {appointment.project_number}</small></span></button>)}</div>
            <div className="calendar-legend">{(Object.keys(appointmentType) as DemoAppointment["type"][]).map((type) => <span key={type}><i className={`is-${type}`} />{appointmentType[type]}</span>)}</div>
          </>}
        </aside>
      </div>
    </div>
  );
}

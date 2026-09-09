import { VisualCalendar } from "@/components/visual-calendar";
import { getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const projects = await getProjects().catch(() => []);
  const appointments = projects
    .filter((p) => p.next_step_date)
    .map((project) => ({
      id: `step-${project.id}`,
      title: `${project.order_number}: ${project.next_step || project.title}`,
      starts_at: `${project.next_step_date}T09:00:00.000Z`,
      type: (project.status === "installation" ? "installation" : "measurement") as "installation" | "measurement",
      duration_minutes: 120,
      assigned_to: "Pracownia YAMURA",
      location: project.title,
      status: "scheduled" as const,
      project_number: project.order_number,
      project_name: project.title,
      customer_name: project.customer_name || "Brak klienta",
      project_id: project.id,
    }))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  return (
    <main className="panel-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Plan pracowni</span>
          <h1>Kalendarz</h1>
          <p>Zaplanowane etapy i terminy realizacji stolarskich YMR.</p>
        </div>
      </div>
      <VisualCalendar appointments={appointments} />
    </main>
  );
}

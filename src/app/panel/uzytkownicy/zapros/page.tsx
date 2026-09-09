import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { getUnassignedProjects } from "@/lib/data";
import { InviteForm } from "./invite-form";

export const metadata = {
  title: "Zaproś klienta · YAMURA",
};

export default async function InviteCustomerPage() {
  await requireStaff();
  const unassignedProjects = await getUnassignedProjects();

  return (
    <main className="panel-content panel-content--narrow">
      <Link href="/panel/uzytkownicy" className="back-link">
        ← Wróć do bazy klientów
      </Link>

      <div className="page-heading">
        <div>
          <span className="eyebrow">Nowy użytkownik</span>
          <h1>Zaproś klienta</h1>
          <p>
            Wygeneruj unikalny link do rejestracji. Podane tu dane zostaną automatycznie wpisane w
            formularzu, a wybrane projekty od razu przypiszą się do jego konta.
          </p>
        </div>
      </div>

      <section className="card form-card">
        <InviteForm unassignedProjects={unassignedProjects} />
      </section>
    </main>
  );
}

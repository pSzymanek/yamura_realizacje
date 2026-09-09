import Link from "next/link";
import { ProjectForm } from "@/components/project-form";
import { getStaffCustomers } from "@/lib/data";

export default async function NewProjectPage() {
  const allCustomers = await getStaffCustomers();
  const customers = allCustomers.map((c) => ({
    id: c.id,
    full_name: c.full_name,
    email: c.email,
    phone: c.phone,
  }));

  return (
    <main className="panel-content panel-content--narrow">
      <Link className="back-link" href="/panel/realizacje">← Wszystkie realizacje</Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Pracownia Stolarska</span>
          <h1>Nowy projekt YMR</h1>
          <p>
            Rejestracja nowego zamówienia. Niezależnie czy startuje od zapytania ofertowego, przygotowania wyceny, czy bezpośrednio od zlecenia produkcyjnego — zachowuje ten sam numer YMR i pełną historię.
          </p>
        </div>
      </div>

      <ProjectForm customers={customers} />
    </main>
  );
}

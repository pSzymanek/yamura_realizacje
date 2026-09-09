import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getStaffCustomers, getProjects } from "@/lib/data";
import { getAppUrl } from "@/lib/env";
import { EditCustomerForm } from "./edit-customer-form";

export const metadata = {
  title: "Edycja użytkownika · YAMURA PRO",
};

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const [allCustomers, projects] = await Promise.all([
    getStaffCustomers(),
    getProjects().catch(() => []),
  ]);

  const customer = allCustomers.find((c) => c.id === id);
  if (!customer) {
    notFound();
  }

  const allProjects = projects.map((p) => ({
    id: p.id,
    order_number: p.order_number,
    title: p.title,
    customer_name: p.customer_name,
  }));

  const appUrl = getAppUrl();

  return (
    <main className="panel-content panel-content--narrow">
      <Link href="/panel/uzytkownicy" className="back-link">
        ← Wróć do bazy klientów
      </Link>

      <div className="page-heading">
        <div>
          <span className="eyebrow">Zarządzanie kontem</span>
          <h1>Edycja użytkownika</h1>
          <p>
            {customer.full_name} ({customer.email})
          </p>
        </div>
      </div>

      <EditCustomerForm
        customer={customer}
        allProjects={allProjects}
        appUrl={appUrl}
      />
    </main>
  );
}

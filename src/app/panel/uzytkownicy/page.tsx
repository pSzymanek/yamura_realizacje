import Link from "next/link";

import { getStaffCustomers, getProjects } from "@/lib/data";
import { getAppUrl } from "@/lib/env";
import { UsersTableClient } from "./users-table-client";

export const dynamic = "force-dynamic";

const statusLabels = { active: "Aktywne", invited: "Zaproszone", inactive: "Nieaktywne" } as const;

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const [params, allCustomers, projects] = await Promise.all([
    searchParams,
    getStaffCustomers(),
    getProjects().catch(() => []),
  ]);
  const appUrl = getAppUrl();
  const allProjects = projects.map((p) => ({
    id: p.id,
    order_number: p.order_number,
    title: p.title,
    customer_name: p.customer_name,
  }));

  const query = (params.q || "").trim().toLocaleLowerCase("pl");
  const status = Object.hasOwn(statusLabels, params.status || "") ? params.status : "";
  const customers = allCustomers.filter((customer) => {
    const haystack = [customer.full_name, customer.email, customer.phone, customer.address, customer.city, ...customer.project_numbers].join(" ").toLocaleLowerCase("pl");
    return (!query || haystack.includes(query)) && (!status || customer.status === status);
  });
  const totalProjects = allCustomers.reduce((sum, customer) => sum + customer.project_numbers.length, 0);

  return <main className="panel-content">
    <div className="page-heading">
      <div>
        <span className="eyebrow">Baza klientów</span>
        <h1>Użytkownicy</h1>
        <p>Profile klientów, dane kontaktowe i powiązane realizacje w pracowni.</p>
      </div>
      <Link href="/panel/uzytkownicy/zapros" className="button button--primary">+ Zaproś klienta</Link>
    </div>

    <section className="admin-metrics" aria-label="Podsumowanie użytkowników">
      <article><span>Wszyscy klienci</span><strong>{allCustomers.length}</strong></article>
      <article><span>Aktywne konta</span><strong>{allCustomers.filter((item) => item.status === "active").length}</strong></article>
      <article><span>Wysłane zaproszenia</span><strong>{allCustomers.filter((item) => item.status === "invited").length}</strong></article>
      <article><span>Powiązane projekty</span><strong>{totalProjects}</strong></article>
    </section>

    <form className="filters admin-user-filters" method="get">
      <div className="field field--search">
        <label className="sr-only" htmlFor="user-query">Szukaj użytkownika</label>
        <input id="user-query" name="q" defaultValue={params.q || ""} placeholder="Imię, e-mail, telefon lub numer projektu…" />
      </div>
      <div className="field">
        <label className="sr-only" htmlFor="user-status">Status konta</label>
        <select id="user-status" name="status" defaultValue={status}>
          <option value="">Wszystkie statusy</option>
          {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </div>
      <button className="button button--secondary" type="submit">Filtruj</button>
      {(query || status) && <Link className="filters__clear" href="/panel/uzytkownicy">Wyczyść</Link>}
    </form>

    <UsersTableClient
      customers={customers}
      allProjects={allProjects}
      appUrl={appUrl}
    />
  </main>;
}

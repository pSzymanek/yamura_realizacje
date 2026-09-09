import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { getProjects, getStaffCustomers } from "@/lib/data";

export const dynamic = "force-dynamic";

function normalize(value: string) {
  return value.toLocaleLowerCase("pl").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s+/g, " ").trim();
}

function matches(query: string, values: Array<string | null | undefined>) {
  if (!query) return false;
  const normalized = normalize(query);
  const digits = query.replace(/\D/g, "");
  return values.some((value) => {
    const text = String(value || "");
    return normalize(text).includes(normalized) || (digits.length >= 3 && text.replace(/\D/g, "").includes(digits));
  });
}

export default async function AdminSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [{ q = "" }, allProjects, allCustomers] = await Promise.all([
    searchParams,
    getProjects().catch(() => []),
    getStaffCustomers().catch(() => []),
  ]);
  const query = q.trim();
  const customers = allCustomers.filter((customer) => matches(query, [customer.full_name, customer.email, customer.phone, customer.address, customer.city, ...customer.project_numbers]));
  const projects = allProjects.filter((project) => matches(query, [project.order_number, project.title, project.customer_name, project.customer_email, project.next_step, project.status]));
  const total = customers.length + projects.length;

  return <main className="panel-content">
    <div className="page-heading">
      <div>
        <span className="eyebrow">Wyszukiwarka</span>
        <h1>Szukaj w pracowni</h1>
        <p>Klienci, realizacje, dane kontaktowe i numery zamówień w jednym miejscu.</p>
      </div>
    </div>
    <form className="admin-search-hero" method="get">
      <label htmlFor="search-all">Czego szukasz?</label>
      <div>
        <input id="search-all" name="q" autoFocus defaultValue={query} placeholder="Wpisz numer YAM, nazwisko, e-mail lub słowo z projektu…" />
        <button type="submit">Szukaj →</button>
      </div>
      <p>Możesz wpisać numer projektu (np. YAM/2026/92), nazwisko klienta lub fragment adresu e-mail.</p>
    </form>

    {query && (
      <>
        <div className="admin-search-summary">
          <span>Wyniki dla</span>
          <strong>„{query}”</strong>
          <b>{total} {total === 1 ? "wynik" : "wyników"}</b>
        </div>

        {customers.length > 0 && (
          <section className="admin-result-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Klienci</span>
                <h2>Użytkownicy</h2>
              </div>
              <span>{customers.length}</span>
            </div>
            <div className="admin-result-grid">
              {customers.map((customer) => (
                <article key={customer.id}>
                  <div className="admin-result-icon">{customer.full_name.slice(0, 1).toUpperCase()}</div>
                  <div>
                    <h3>{customer.full_name}</h3>
                    <p>{customer.email} {customer.phone !== "—" ? `· ${customer.phone}` : ""}</p>
                    {customer.city !== "—" && <small>{customer.city}</small>}
                  </div>
                  <div>
                    <Link href={`/panel/uzytkownicy?q=${encodeURIComponent(customer.email !== "—" ? customer.email : customer.full_name)}`}>
                      Otwórz profil →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="admin-result-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">Realizacje</span>
                <h2>Projekty</h2>
              </div>
              <span>{projects.length}</span>
            </div>
            <div className="admin-result-grid">
              {projects.map((project) => (
                <article key={project.id}>
                  <div className="admin-result-icon">Y</div>
                  <div>
                    <span className="eyebrow">{project.order_number}</span>
                    <h3>{project.title}</h3>
                    <p>{project.customer_name || "Pracownia"} {project.customer_email ? `· ${project.customer_email}` : ""}</p>
                  </div>
                  <div>
                    <StatusBadge status={project.status} />
                    <Link href={`/panel/realizacje/${project.id}`}>
                      Otwórz realizację →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!total && (
          <div className="empty-state admin-search-empty">
            <h2>Brak wyników</h2>
            <p>Sprawdź pisownię lub spróbuj wpisać krótszy fragment numeru zamówienia lub nazwiska.</p>
          </div>
        )}
      </>
    )}
  </main>;
}

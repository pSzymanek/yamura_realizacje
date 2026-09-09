import Link from "next/link";

import { CustomerPageHeading } from "@/components/customer-page-heading";
import { StatusBadge } from "@/components/status-badge";
import { requireCustomer } from "@/lib/auth";
import { demoCustomerProfile, demoCustomerProjects, isLocalCustomerPreview } from "@/lib/customer-demo";
import { getCustomerProjects } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default async function CustomerDashboardPage() {
  const [{ profile }, projects] = await Promise.all([requireCustomer(), getCustomerProjects()]);
  const active = projects.filter((project) => project.status !== "completed");
  const completed = projects.filter((project) => project.status === "completed");
  const nextProject = active[0];
  const allDemoProjects = isLocalCustomerPreview() ? demoCustomerProjects.filter((project) => project.customer_name === demoCustomerProfile.full_name) : [];
  const pendingDecision = allDemoProjects.find((project) => project.next_action?.audience === "customer" && project.next_action?.status === "open");

  return (
    <main className="customer-content">
      <CustomerPageHeading
        eyebrow="Dzień dobry"
        title={profile.full_name ? `Witaj, ${profile.full_name.split(" ")[0]}` : "Witaj w YAMURA"}
        description="W jednym miejscu sprawdzisz realizacje, dokumenty i kolejne kroki współpracy."
      />

      {pendingDecision && <Link className="customer-attention-card" href={`/konto/realizacje/${pendingDecision.id}`}><div><span className="customer-eyebrow">Wymaga Twojej uwagi</span><h2>{pendingDecision.next_action?.title}</h2><p>{pendingDecision.scope} · {pendingDecision.order_number}</p></div><div><strong>{pendingDecision.next_action?.due_date ? formatDate(pendingDecision.next_action.due_date) : "Bez terminu"}</strong><span>Sprawdź i zdecyduj →</span></div></Link>}

      <section className="customer-metric-grid" aria-label="Podsumowanie konta">
        <article><span>Wszystkie projekty</span><strong>{allDemoProjects.length || projects.length}</strong><small>z wycenami i archiwum</small></article>
        <article><span>Zakończone</span><strong>{completed.length}</strong><small>w historii konta</small></article>
        <article><span>Najbliższy krok</span><strong className="customer-metric-grid__text">{nextProject?.next_step || "Konsultacja projektu"}</strong><small>{nextProject?.next_step_date ? formatDate(nextProject.next_step_date) : "ustalimy wspólnie"}</small></article>
      </section>

      <div className="customer-dashboard-grid">
        <section className="customer-surface customer-surface--featured">
          <div className="customer-section-title">
            <div><span className="customer-eyebrow">Aktualna realizacja</span><h2>{nextProject?.title || "Twoja przestrzeń. Nasza precyzja."}</h2></div>
            {nextProject && <StatusBadge status={nextProject.status} />}
          </div>
          {nextProject ? (
            <>
              <div className="customer-order-meta">
                <div><span>Numer projektu</span><strong>{nextProject.order_number}</strong></div>
                <div><span>Następny krok</span><strong>{nextProject.next_step || "Aktualizacja wkrótce"}</strong></div>
                <div><span>Planowany termin</span><strong>{nextProject.next_step_date ? formatDate(nextProject.next_step_date) : "Do ustalenia"}</strong></div>
              </div>
              <Link className="customer-button customer-button--dark" href={`/konto/realizacje/${nextProject.id}`}>Zobacz szczegóły <span>→</span></Link>
            </>
          ) : (
            <>
              <p className="customer-empty-copy">Konto jest gotowe. Gdy przypiszemy pierwszą realizację, jej status pojawi się właśnie tutaj.</p>
              <Link className="customer-button customer-button--dark" href="/konto/kalkulator">Oblicz orientacyjną wycenę <span>→</span></Link>
            </>
          )}
        </section>

        <aside className="customer-surface customer-concierge">
          <span className="customer-eyebrow">Twój opiekun</span>
          <h2>Jesteśmy tu dla Ciebie.</h2>
          <p>Masz pytanie o projekt, materiały albo termin? Napisz do zespołu YAMURA.</p>
          <Link href="/konto/kontakt">Rozpocznij rozmowę <span>→</span></Link>
        </aside>
      </div>

      <section className="customer-quick-grid" aria-label="Skróty">
        <Link href="/konto/kalkulator"><span>01</span><h3>Kalkulator wyceny</h3><p>Poznaj orientacyjny budżet projektu mebli.</p><b>Przejdź →</b></Link>
        <Link href="/konto/konsultacja"><span>02</span><h3>Umów konsultację</h3><p>Zostaw kontakt — odezwiemy się w celu ustalenia terminu.</p><b>Przejdź →</b></Link>
        <Link href="/konto/realizacje"><span>03</span><h3>Projekty i wyceny</h3><p>Historia od przesłanego projektu po podpisaną umowę.</p><b>Przejdź →</b></Link>
      </section>
    </main>
  );
}

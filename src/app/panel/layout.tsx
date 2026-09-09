import Image from "next/image";
import Link from "next/link";

import { AdminMobileNav } from "@/components/admin-mobile-nav";
import { SidebarCountdown } from "@/components/sidebar-countdown";
import { logoutAction } from "@/lib/actions";
import { requireStaff } from "@/lib/auth";
import { getProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const [{ profile, user }, projects] = await Promise.all([
    requireStaff(),
    getProjects().catch(() => []),
  ]);
  const activeProjects = projects.filter((p) => p.status !== "completed");
  const primaryProject = activeProjects[0] || null;

  return (
    <div className="panel-shell">
      <aside className="sidebar">
        <Link href="/panel" className="sidebar__logo" aria-label="YAMURA — realizacje">
          <Image src="/brand/yamura-light.png" alt="YAMURA PRO" width={160} height={38} style={{ width: "160px", height: "auto" }} priority />
          <span>Dziennik realizacji</span>
        </Link>
        {activeProjects.length > 0 && (
          <SidebarCountdown projects={activeProjects} hrefPrefix="/panel/realizacje" />
        )}
        <nav className="sidebar__nav" aria-label="Panel">
          <span>Obsługa</span>
          <Link href="/panel">Pulpit</Link>
          <Link href="/panel/realizacje">Projekty i realizacje</Link>
          <Link href="/panel/kalendarz">Kalendarz</Link>
          <Link href="/panel/uzytkownicy">Użytkownicy</Link>
          <Link href="/panel/wiadomosci">Wiadomości</Link>
          <span>Narzędzia</span>
          <Link href="/panel/szukaj">Wyszukiwarka</Link>
          <Link href="/panel/nowa">Nowy projekt</Link>
          <Link href="/panel/kalkulator">Kalkulator wyceny</Link>
        </nav>
        <div className="sidebar__account">
          <span>{profile.full_name || user.email}</span>
          <small>{profile.role === "admin" ? "Administrator" : "Pracownik"}</small>
          <form action={logoutAction}>
            <button type="submit">Wyloguj się</button>
          </form>
        </div>
      </aside>
      <div className="panel-main">
        <header className="mobile-header">
          <Link href="/panel">
            <Image src="/brand/yamura-dark.png" alt="YAMURA PRO" width={130} height={31} style={{ width: "130px", height: "auto" }} priority />
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link className="mobile-header__new" href="/panel/nowa">+ Nowa</Link>
          </div>
        </header>
        <AdminMobileNav />
        <form className="admin-global-search" action="/panel/szukaj" method="get">
          <label className="sr-only" htmlFor="admin-global-query">Szukaj w panelu</label>
          <span aria-hidden="true">⌕</span>
          <input id="admin-global-query" name="q" placeholder="Szukaj klienta, telefonu, e-maila lub numeru projektu…" />
          <button type="submit">Szukaj</button>
        </form>
        {children}
      </div>
    </div>
  );
}

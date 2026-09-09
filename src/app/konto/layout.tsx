import Image from "next/image";
import Link from "next/link";

import { CustomerNav } from "@/components/customer-nav";
import { SidebarCountdown } from "@/components/sidebar-countdown";
import { ActiveOrdersTopbar } from "@/components/active-orders-topbar";
import { ActiveProjectSyncProvider } from "@/components/active-project-sync-context";
import { logoutAction } from "@/lib/actions";
import { requireCustomer } from "@/lib/auth";
import { getCustomerProjects } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const [{ profile, user }, projects] = await Promise.all([
    requireCustomer(),
    getCustomerProjects().catch(() => []),
  ]);
  const displayName = profile.full_name || "Klient YAMURA";
  const activeProjects = projects.filter((p) => p.status !== "completed" && !p.is_internal);

  return (
    <ActiveProjectSyncProvider projects={activeProjects}>
      <div className="customer-shell">
      <aside className="customer-sidebar">
        <Link href="/konto" className="customer-sidebar__brand" aria-label="YAMURA — panel klienta">
          <Image src="/brand/yamura-light.png" alt="YAMURA PRO" width={160} height={38} style={{ width: "160px", height: "auto" }} priority />
          <span>Strefa klienta</span>
        </Link>
        {activeProjects.length > 0 && (
          <SidebarCountdown projects={activeProjects} hrefPrefix="/konto/realizacje" />
        )}
        <CustomerNav />
        <div className="customer-sidebar__account">
          <div className="customer-avatar" aria-hidden="true">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>{displayName}</strong>
            <span>{user.email}</span>
          </div>
          <form action={logoutAction}>
            <button type="submit">Wyloguj</button>
          </form>
        </div>
      </aside>
      <div className="customer-workspace">
        <header className="customer-mobile-header">
          <Link href="/konto">
            <Image src="/brand/yamura-dark.png" alt="YAMURA PRO" width={130} height={31} style={{ width: "130px", height: "auto" }} priority />
          </Link>
          <span>Strefa klienta</span>
        </header>
        <div className="customer-mobile-nav"><CustomerNav /></div>
        <div className="customer-topbar">
          <div className="customer-topbar__brand-text">
            <span>YAMURA · Polska produkcja · Japońska precyzja</span>
          </div>
          {activeProjects.length > 0 && (
            <ActiveOrdersTopbar projects={activeProjects} />
          )}
          <div className="customer-topbar__badge"><i aria-hidden="true" /> Konto klienta</div>
        </div>
        {children}
      </div>
    </div>
    </ActiveProjectSyncProvider>
  );
}

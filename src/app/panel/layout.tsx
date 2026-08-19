import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/lib/actions";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireStaff();

  return (
    <div className="panel-shell">
      <aside className="sidebar">
        <Link href="/panel" className="sidebar__logo" aria-label="YAMURA — realizacje">
          <Image src="/brand/yamura-light.png" alt="YAMURA" width={180} height={60} priority />
          <span>Dziennik realizacji</span>
        </Link>
        <nav className="sidebar__nav" aria-label="Panel">
          <Link href="/panel">Realizacje</Link>
          <Link href="/panel/nowa">Nowa realizacja</Link>
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
            <Image src="/brand/yamura-dark.png" alt="YAMURA" width={132} height={44} priority />
          </Link>
          <Link className="mobile-header__new" href="/panel/nowa">+ Nowa</Link>
        </header>
        {children}
      </div>
    </div>
  );
}

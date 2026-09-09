"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions";

const navLinks = [
  { href: "/panel", label: "Pulpit", exact: true },
  { href: "/panel/realizacje", label: "Realizacje" },
  { href: "/panel/uzytkownicy", label: "Użytkownicy" },
  { href: "/panel/kalendarz", label: "Kalendarz" },
  { href: "/panel/nowa", label: "+ Nowy" },
  { href: "/panel/kalkulator", label: "Kalkulator" },
  { href: "/panel/wiadomosci", label: "Wiadomości" },
  { href: "/panel/szukaj", label: "Szukaj" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <div className="admin-mobile-nav-wrapper">
      <nav className="admin-mobile-nav-scroll" aria-label="Nawigacja mobilna panelu">
        {navLinks.map((link) => {
          const isActive = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`admin-mobile-nav-item ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {link.label}
            </Link>
          );
        })}
        <form action={logoutAction} className="admin-mobile-nav-logout-form">
          <button type="submit" className="admin-mobile-nav-logout-btn">
            Wyloguj
          </button>
        </form>
      </nav>
    </div>
  );
}

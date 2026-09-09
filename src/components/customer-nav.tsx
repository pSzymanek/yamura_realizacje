"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/konto", label: "Pulpit", icon: "home" },
  { href: "/konto/realizacje", label: "Realizacje", icon: "projects" },
  { href: "/konto/kalkulator", label: "Kalkulator wyceny", icon: "calculator" },
  { href: "/konto/konsultacja", label: "Umów konsultację", icon: "calendar" },
  { href: "/konto/kontakt", label: "Kontakt", icon: "chat" },
  { href: "/konto/profil", label: "Konto", icon: "account" },
] as const;

function NavIcon({ name }: { name: (typeof links)[number]["icon"] }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "home") return <svg {...common}><path d="m3 11 9-8 9 8" /><path d="M5.5 9.5V21h13V9.5" /><path d="M9.5 21v-6h5v6" /></svg>;
  if (name === "projects") return <svg {...common}><rect x="3" y="5" width="18" height="15" rx="1" /><path d="M8 5V3h8v2M7 10h10M7 14h6" /></svg>;
  if (name === "calculator") return <svg {...common}><rect x="4" y="2.5" width="16" height="19" rx="1" /><path d="M7.5 6h9v3h-9zM8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01" /></svg>;
  if (name === "calendar") return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M8 3v4M16 3v4M3 10h18M8 14h2M14 14h2M8 18h2" /></svg>;
  if (name === "chat") return <svg {...common}><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3Z" /><path d="M7 8h10M7 12h6" /></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></svg>;
}

export function CustomerNav() {
  const pathname = usePathname();

  return (
    <nav className="customer-nav" aria-label="Panel klienta">
      {links.map((link) => {
        const active = link.href === "/konto"
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "customer-nav__link customer-nav__link--active" : "customer-nav__link"}
            aria-current={active ? "page" : undefined}
          >
            <NavIcon name={link.icon} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

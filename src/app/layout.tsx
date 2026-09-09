import type { Metadata } from "next";

import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: {
    default: "Dziennik Realizacji | YAMURA",
    template: "%s | YAMURA",
  },
  description: "Prywatny dziennik realizacji zamówień YAMURA.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}

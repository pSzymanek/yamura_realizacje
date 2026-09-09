import { notFound } from "next/navigation";
import Image from "next/image";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dokończ rejestrację · YAMURA",
  robots: { index: false, follow: false, nocache: true },
};

export default async function RegistrationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token)) {
    notFound();
  }

  const adminClient = createSupabaseAdminClient();
  const { data: invite } = await adminClient
    .from("invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (!invite) {
    return (
      <main className="login-panel" style={{ minHeight: "100svh" }}>
        <div className="login-box">
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <Image src="/brand/yamura-dark.png" alt="YAMURA PRO" width={180} height={43} style={{ width: "180px", height: "auto", margin: "0 auto", display: "block" }} priority />
          </div>
          <h2>Błąd zaproszenia</h2>
          <p className="muted">To zaproszenie jest nieprawidłowe lub zostało już wykorzystane.</p>
        </div>
      </main>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <main className="login-panel" style={{ minHeight: "100svh" }}>
        <div className="login-box">
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <Image src="/brand/yamura-dark.png" alt="YAMURA PRO" width={180} height={43} style={{ width: "180px", height: "auto", margin: "0 auto", display: "block" }} priority />
          </div>
          <h2>Zaproszenie wygasło</h2>
          <p className="muted">Ten link stracił ważność. Skontaktuj się ze stolarnią, aby otrzymać nowe zaproszenie.</p>
        </div>
      </main>
    );
  }

  const prefilled = invite.prefilled_data || {};

  return (
    <main className="login-panel" style={{ minHeight: "100svh", background: "var(--paper)" }}>
      <div className="login-box" style={{ width: "min(100%, 480px)" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <Image src="/brand/yamura-dark.png" alt="YAMURA PRO" width={180} height={43} style={{ width: "180px", height: "auto", margin: "0 auto", display: "block" }} priority />
        </div>
        <div className="card form-card">
          <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>Witaj</h1>
          <RegisterForm 
            token={token}
            email={invite.email}
            defaultName={prefilled.full_name || ""}
            defaultPhone={prefilled.phone || ""}
          />
        </div>
      </div>
    </main>
  );
}

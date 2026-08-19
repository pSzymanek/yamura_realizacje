import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect("/panel");
  const params = await searchParams;

  return (
    <main className="login-page">
      <section className="login-brand" aria-hidden="true">
        <Image src="/brand/yamura-light.png" alt="" width={242} height={81} priority />
        <div>
          <p className="login-brand__kicker">Spokojnie. Precyzyjnie. Na bieżąco.</p>
          <h1>Każda realizacja ma swój rytm.</h1>
          <p>Tu zapisujemy jej kolejne etapy.</p>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-box">
          <Image
            className="login-mobile-logo"
            src="/brand/yamura-dark.png"
            alt="YAMURA"
            width={176}
            height={59}
            priority
          />
          <span className="eyebrow">Panel pracownika</span>
          <h2>Zaloguj się</h2>
          <p className="muted">Dostęp wyłącznie dla zespołu YAMURA.</p>
          {params.error === "inactive" && (
            <div className="form-message form-message--error" role="alert">
              To konto nie ma aktywnego dostępu do panelu.
            </div>
          )}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { ProgressTimeline } from "@/components/progress-timeline";
import { StageCountdown } from "@/components/stage-countdown";
import { StatusBadge } from "@/components/status-badge";
import { UpdatesList } from "@/components/updates-list";
import { getClientProject } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Przebieg realizacji",
  robots: { index: false, follow: false, nocache: true },
};

export default async function ClientProjectPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const project = await getClientProject(token);
  if (!project) notFound();

  return (
    <main className="client-page">
      <header className="client-header">
        <Image src="/brand/yamura-dark.png" alt="YAMURA PRO" width={170} height={41} style={{ width: "170px", height: "auto" }} priority />
        <div className="client-header__project">
          <span>Realizacja {project.order_number}</span>
          <h1>{project.title}</h1>
        </div>
      </header>

      <section className="client-hero">
        <div className="client-hero__intro">
          <span className="eyebrow">Aktualny stan</span>
          <StatusBadge status={project.status} />
        </div>

        <div style={{ margin: "16px 0" }}>
          <StageCountdown
            targetDate={project.next_step_date}
            status={project.status}
            stageName={project.title}
            variant="card"
          />
        </div>

        <div className="client-next-grid">
          <div>
            <span>Następny krok</span>
            <strong>{project.next_step || "Poinformujemy w kolejnej aktualizacji"}</strong>
          </div>
          <div>
            <span>Orientacyjna data</span>
            <strong>{project.next_step_date ? formatDate(project.next_step_date) : "Do potwierdzenia"}</strong>
          </div>
        </div>
        <p className="client-hero__note">
          Daty mają charakter orientacyjny. O każdej istotnej zmianie poinformujemy w tym dzienniku.
        </p>
      </section>

      <section className="client-section client-progress-section">
        <div className="client-section__heading">
          <span className="eyebrow">Przebieg realizacji</span>
          <h2>Kolejne etapy</h2>
        </div>
        <ProgressTimeline currentStatus={project.status} updates={project.updates} />
      </section>

      <section className="client-section client-journal">
        <div className="client-section__heading">
          <span className="eyebrow">Dziennik</span>
          <h2>Co dzieje się teraz</h2>
        </div>
        <UpdatesList updates={project.updates} variant="client" />
      </section>

      <footer className="client-footer">
        <Image src="/brand/yamura-dark.png" alt="YAMURA PRO" width={110} height={26} style={{ width: "110px", height: "auto" }} />
        <p>Dziękujemy za zaufanie.</p>
      </footer>
    </main>
  );
}

import Link from "next/link";

import { ProjectForm } from "@/components/project-form";

export default function NewProjectPage() {
  return (
    <main className="panel-content panel-content--narrow">
      <Link className="back-link" href="/panel">← Wszystkie realizacje</Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Nowa realizacja</span>
          <h1>Dodaj zamówienie</h1>
          <p>Po zapisaniu system wygeneruje prywatny link dla klienta.</p>
        </div>
      </div>
      <ProjectForm />
    </main>
  );
}

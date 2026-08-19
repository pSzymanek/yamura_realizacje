import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <main className="panel-content">
      <div className="empty-state empty-state--large">
        <h1>Nie znaleziono realizacji</h1>
        <p>Realizacja nie istnieje albo nie masz do niej dostępu.</p>
        <Link className="button button--primary" href="/panel">Wróć do listy</Link>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";

import { formatDate } from "@/lib/format";
import type { DemoQuoteVersion } from "@/lib/types";

function money(value: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(value);
}

export function CustomerProjectDecision({ quote }: { quote: DemoQuoteVersion }) {
  const [decision, setDecision] = useState<"accepted" | "question" | null>(null);
  return <section className="customer-decision-card">
    <div><span className="customer-eyebrow">Wymaga Twojej decyzji</span><h2>Wycena jest gotowa</h2><p>Sprawdź zakres i wybierz dalszy krok. W demonstratorze decyzja zmienia tylko ten widok.</p></div>
    <div className="customer-decision-card__quote"><span>{quote.number} · wersja {quote.version}</span><strong>{money(quote.amount_gross)}</strong><small>Ważna do {formatDate(quote.valid_until)}</small></div>
    {!decision ? <div className="customer-decision-card__actions"><button type="button" onClick={() => setDecision("accepted")}>Akceptuję wycenę</button><button type="button" onClick={() => setDecision("question")}>Poproś o zmianę</button></div> : <div className="customer-decision-feedback" role="status"><strong>{decision === "accepted" ? "Wybrano akceptację wyceny" : "Wybrano prośbę o zmianę"}</strong><span>To podgląd demonstracyjny — decyzja nie została zapisana ani wysłana.</span><button type="button" onClick={() => setDecision(null)}>Cofnij wybór</button></div>}
  </section>;
}

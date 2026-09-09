import { CustomerPageHeading } from "@/components/customer-page-heading";
import { CustomerCalculator } from "@/components/customer-calculator";

export default function CalculatorPage() {
  return <main className="customer-content"><CustomerPageHeading eyebrow="Pierwszy krok" title="Kalkulator wyceny" description="Sprawdź orientacyjny budżet zabudowy. Wynik nie jest ofertą handlową — pomaga dobrze przygotować konsultację." /><CustomerCalculator /></main>;
}

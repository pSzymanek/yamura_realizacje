import { YamuraFurnitureCalculator } from "@/components/furniture-calculator";

export default function PanelCalculatorPage() {
  return (
    <main className="panel-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Narzędzie wyceny</span>
          <h1>Kalkulator mebli na wymiar</h1>
          <p>
            Zaawansowane szacowanie kosztu produkcji: rozkrój płyt, HDF, oklejanie krawędzi, fronty, blaty, akcesoria, robocizna i kontrola marży.
          </p>
        </div>
      </div>
      <YamuraFurnitureCalculator />
    </main>
  );
}

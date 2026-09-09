"use client";

import { useEffect, useRef } from "react";
import { CALCULATOR_HTML } from "./calculator-html";
import { initCalculatorEngine } from "./calculator-engine";
import "./calculator.css";

export function YamuraFurnitureCalculator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Dynamic load of jsPDF if not present
    if (typeof window !== "undefined" && !(window as any).jspdf) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      script.async = true;
      document.head.appendChild(script);
    }

    if (containerRef.current && !initializedRef.current) {
      initializedRef.current = true;
      initCalculatorEngine(containerRef.current);
    }
  }, []);

  return (
    <div className="yamura-calc-wrapper">
      <div
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: CALCULATOR_HTML }}
      />
    </div>
  );
}

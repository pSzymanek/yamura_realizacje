import Image from "next/image";

export default function ClientProjectNotFound() {
  return (
    <main className="client-not-found">
      <Image src="/brand/yamura-dark.png" alt="YAMURA PRO" width={170} height={41} style={{ width: "170px", height: "auto" }} priority />
      <span className="eyebrow">Dziennik realizacji</span>
      <h1>Ten link nie jest aktywny</h1>
      <p>Sprawdź, czy cały adres został skopiowany poprawnie. Jeśli problem się powtarza, skontaktuj się z opiekunem realizacji.</p>
    </main>
  );
}

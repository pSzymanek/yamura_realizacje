import { CustomerPageHeading } from "@/components/customer-page-heading";
import { CustomerChat } from "@/components/customer-chat";

export default function ContactPage() {
  return <main className="customer-content"><CustomerPageHeading eyebrow="Bezpośredni kontakt" title="Rozmowa z YAMURA" description="Jedno miejsce na pytania, ustalenia i wiadomości dotyczące Twoich projektów." /><CustomerChat /></main>;
}

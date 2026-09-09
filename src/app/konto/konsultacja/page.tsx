import { CustomerPageHeading } from "@/components/customer-page-heading";
import { ConsultationBooking } from "@/components/consultation-booking";

export default function ConsultationPage() {
  return (
    <main className="customer-content">
      <CustomerPageHeading
        eyebrow="Kontakt z pracownią"
        title="Umów konsultację"
        description="Zostaw do siebie kontakt. Odezwiemy się telefonicznie lub mailowo, aby wspólnie ustalić dogodny termin i omówić szczegóły Twojego projektu."
      />
      <ConsultationBooking />
    </main>
  );
}

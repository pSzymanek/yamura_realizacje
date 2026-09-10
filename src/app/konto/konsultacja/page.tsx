import { CustomerPageHeading } from "@/components/customer-page-heading";
import { ConsultationBooking } from "@/components/consultation-booking";
import { requireCustomer } from "@/lib/auth";
import { getCustomerProjects } from "@/lib/data";

export default async function ConsultationPage() {
  const [{ profile, user }, projects] = await Promise.all([
    requireCustomer(),
    getCustomerProjects().catch(() => []),
  ]);

  return (
    <main className="customer-content">
      <CustomerPageHeading
        eyebrow="Kontakt z pracownią"
        title="Umów konsultację"
        description="Zostaw do siebie kontakt. Odezwiemy się telefonicznie lub mailowo, aby wspólnie ustalić dogodny termin i omówić szczegóły Twojego projektu."
      />
      <ConsultationBooking
        initialFullName={profile.full_name || ""}
        initialPhone={profile.phone || ""}
        initialEmail={user.email || ""}
        projects={projects.map((p) => ({
          id: p.id,
          order_number: p.order_number,
          title: p.title,
        }))}
      />
    </main>
  );
}

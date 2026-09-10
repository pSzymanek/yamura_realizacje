import { CustomerPageHeading } from "@/components/customer-page-heading";
import { CustomerChat } from "@/components/customer-chat";
import { requireCustomer } from "@/lib/auth";
import { getCustomerProjects } from "@/lib/data";

export default async function ContactPage() {
  const [{ profile, user }, projects] = await Promise.all([
    requireCustomer(),
    getCustomerProjects().catch(() => []),
  ]);

  return (
    <main className="customer-content">
      <CustomerPageHeading
        eyebrow="Bezpośredni kontakt"
        title="Rozmowa z YAMURA"
        description="Jedno miejsce na pytania, ustalenia i wiadomości dotyczące Twoich projektów."
      />
      <CustomerChat
        customerName={profile.full_name || ""}
        customerEmail={user.email || ""}
        projects={projects.map((p) => ({
          id: p.id,
          order_number: p.order_number,
          title: p.title,
        }))}
      />
    </main>
  );
}


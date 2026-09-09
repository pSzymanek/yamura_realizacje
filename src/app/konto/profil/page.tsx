import { CustomerPageHeading } from "@/components/customer-page-heading";
import { CustomerComplaintForm } from "@/components/customer-complaint-form";
import { CustomerProfileForm } from "@/components/customer-profile-form";
import { requireCustomer } from "@/lib/auth";
import { getCustomerProjects } from "@/lib/data";

export default async function CustomerProfilePage() {
  const [{ profile, user }, projects] = await Promise.all([requireCustomer(), getCustomerProjects()]);
  const complaintProjects = projects.map((project) => ({ number: project.order_number, title: project.title }));

  return (
    <main className="customer-content">
      <CustomerPageHeading eyebrow="Dane klienta" title="Twoje konto" description="Uzupełnij dane kontaktowe i adres. Będą widoczne wyłącznie dla Ciebie i zespołu obsługującego realizację." />
      <CustomerProfileForm profile={profile} email={user.email || ""} />
      <CustomerComplaintForm projects={complaintProjects} />
    </main>
  );
}

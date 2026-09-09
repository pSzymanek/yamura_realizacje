import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.DEMO_CUSTOMER_EMAIL || "demo.klient@yamura.pl").trim().toLowerCase();
const password = process.env.DEMO_CUSTOMER_PASSWORD;

if (!url || !serviceRoleKey || !password) {
  throw new Error("Ustaw NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY oraz DEMO_CUSTOMER_PASSWORD.");
}
if (password.length < 12) throw new Error("DEMO_CUSTOMER_PASSWORD musi mieć co najmniej 12 znaków.");

const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: listed, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) throw listError;

let user = listed.users.find((candidate) => candidate.email?.toLowerCase() === email);
if (user) {
  const { data, error } = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true, user_metadata: { full_name: "Anna Kowalska", demo_account: true } });
  if (error) throw error;
  user = data.user;
} else {
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: "Anna Kowalska", demo_account: true } });
  if (error) throw error;
  user = data.user;
}

const { error: profileError } = await admin.from("profiles").upsert({
  id: user.id,
  full_name: "Anna Kowalska",
  role: "customer",
  is_active: true,
  phone: "+48 600 123 456",
  address_line1: "ul. Mokotowska 24",
  address_line2: "lok. 7",
  postal_code: "00-561",
  city: "Warszawa",
});
if (profileError) throw profileError;

const projects = [
  { id: "20000000-0000-4000-8000-000000000001", order_number: "YMR/2026/084", title: "Kuchnia i zabudowa strefy dziennej", customer_name: "Anna Kowalska", customer_email: email, customer_user_id: user.id, status: "production", next_step: "Kontrola jakości elementów", next_step_date: "2026-09-16" },
  { id: "20000000-0000-4000-8000-000000000002", order_number: "YMR/2025/041", title: "Garderoba w apartamencie", customer_name: "Anna Kowalska", customer_email: email, customer_user_id: user.id, status: "completed", next_step: "Realizacja zakończona", next_step_date: "2025-12-12" },
];
const { error: projectsError } = await admin.from("projects").upsert(projects, { onConflict: "id" });
if (projectsError) throw projectsError;

const updates = [
  { id: "30000000-0000-4000-8000-000000000001", project_id: projects[0].id, title: "Rozpoczęliśmy produkcję", description: "Materiały zostały sprawdzone i przekazane do produkcji. Wszystkie elementy powstają zgodnie z zatwierdzoną dokumentacją.", status: "production", created_at: "2026-09-03T12:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000002", project_id: projects[0].id, title: "Materiały skompletowane", description: "Skompletowaliśmy fronty, korpusy i okucia. Kolorystyka oraz struktura materiału są zgodne z zaakceptowanymi próbkami.", status: "materials_ready", created_at: "2026-08-22T09:30:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000003", project_id: projects[0].id, title: "Dokumentacja zatwierdzona", description: "Projekt wykonawczy został zatwierdzony. Uzgodniliśmy układ wyposażenia oraz detale zabudowy.", status: "documentation", created_at: "2026-07-28T14:00:00.000Z" },
  { id: "30000000-0000-4000-8000-000000000004", project_id: projects[1].id, title: "Realizacja odebrana", description: "Montaż zakończył się zgodnie z planem. Dokumentacja powykonawcza i faktura zostały dodane do archiwum projektu.", status: "completed", created_at: "2025-12-12T15:00:00.000Z" },
];
const { error: updatesError } = await admin.from("project_updates").upsert(updates, { onConflict: "id" });
if (updatesError) throw updatesError;

console.log(`Konto demonstracyjne gotowe: ${email}`);

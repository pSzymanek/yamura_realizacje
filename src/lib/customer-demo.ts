import type {
  CustomerProfile,
  DemoAdminCustomer,
  
  DemoCaseStage,
  DemoConversation,
  ProjectDetails,
} from "@/lib/types";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function isLocalCustomerPreview() {
  return false;
}

export function isLocalStaffPreview() {
  return false;
}

const nowTime = Date.now();
const dayMs = 86400000;
const inDays = (d: number) => new Date(nowTime + d * dayMs).toISOString().slice(0, 10);

const realizationStages: DemoCaseStage[] = [
  "quote_accepted",
  "measurement",
  "contract",
  "production",
  "installation",
  "completed",
];

export function isRealizationStage(stage: DemoCaseStage) {
  return realizationStages.includes(stage);
}

export const demoStaffProfile = {
  id: "10000000-0000-4000-8000-000000000002",
  full_name: "Piotr Szymanek",
  role: "admin" as const,
  is_active: true,
};

export const demoCustomerProfile: CustomerProfile = {
  id: "10000000-0000-4000-8000-000000000001",
  full_name: "Anna Kowalska",
  role: "customer",
  is_active: true,
  phone: "+48 600 123 456",
  address_line1: "ul. Mokotowska 24",
  address_line2: "lok. 7",
  postal_code: "00-561",
  city: "Warszawa",
};

export const demoCustomerProjects: ProjectDetails[] = [];

export const demoAdminCustomers: DemoAdminCustomer[] = [];

export const demoAdminProjects: ProjectDetails[] = [];

export const demoConversations: DemoConversation[] = [];


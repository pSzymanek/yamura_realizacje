import { AdminChatInbox } from "@/components/admin-chat-inbox";
import { demoConversations } from "@/lib/customer-demo";

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ customer?: string }> }) {
  const { customer } = await searchParams;
  return <main className="panel-content"><div className="page-heading"><div><span className="eyebrow">Kontakt z klientami</span><h1>Wiadomości</h1><p>Rozmowy prowadzone w strefie klienta wraz z kontekstem realizacji.</p></div></div><AdminChatInbox initialConversations={demoConversations} initialCustomerId={customer} /></main>;
}

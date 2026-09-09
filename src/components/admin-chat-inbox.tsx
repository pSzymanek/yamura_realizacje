"use client";

import { FormEvent, useMemo, useState } from "react";

import type { DemoConversation } from "@/lib/types";

export function AdminChatInbox({ initialConversations, initialCustomerId }: { initialConversations: DemoConversation[]; initialCustomerId?: string }) {
  const initial = initialConversations.find((item) => item.customer_id === initialCustomerId)?.id || initialConversations[0]?.id || "";
  const [conversations, setConversations] = useState(() =>
    initialConversations.map((item) => item.id === initial ? { ...item, unread_count: 0 } : item),
  );
  const [selectedId, setSelectedId] = useState(initial);
  const [query, setQuery] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [reply, setReply] = useState("");
  const filtered = useMemo(() => conversations.filter((item) => {
    const text = `${item.customer_name} ${item.customer_email} ${item.project_number || ""} ${item.project_title || ""}`.toLocaleLowerCase("pl");
    return (!query || text.includes(query.toLocaleLowerCase("pl"))) && (!onlyUnread || item.unread_count > 0);
  }), [conversations, query, onlyUnread]);
  const selected = conversations.find((item) => item.id === selectedId) || filtered[0];
  const choose = (id: string) => { setSelectedId(id); setConversations((items) => items.map((item) => item.id === id ? { ...item, unread_count: 0 } : item)); };
  const send = (event: FormEvent) => { event.preventDefault(); const body = reply.trim(); if (!body || !selected) return; setConversations((items) => items.map((item) => item.id === selected.id ? { ...item, updated_at: new Date().toISOString(), messages: [...item.messages, { id: `demo-${Date.now()}`, sender: "staff", sender_name: "Piotr · YAMURA", body, created_at: new Date().toISOString() }] } : item)); setReply(""); };
  const time = (value: string) => new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

  return <div className="admin-inbox">
    <aside className="admin-inbox__list"><div className="admin-inbox__tools"><label><span className="sr-only">Szukaj rozmowy</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj rozmowy…" /></label><button type="button" className={onlyUnread ? "is-active" : ""} onClick={() => setOnlyUnread(!onlyUnread)}>Tylko nieprzeczytane</button></div><div className="admin-conversation-list">{filtered.map((conversation) => { const last = conversation.messages.at(-1); return <button type="button" key={conversation.id} onClick={() => choose(conversation.id)} className={selected?.id === conversation.id ? "is-selected" : ""}><i>{conversation.customer_name.slice(0, 1)}</i><span><strong>{conversation.customer_name}</strong><small>{conversation.project_number || "Rozmowa ogólna"}</small><p>{last?.body}</p></span><time>{time(conversation.updated_at)}</time>{conversation.unread_count > 0 && <b>{conversation.unread_count}</b>}</button>; })}{!filtered.length && <p className="admin-inbox-empty">Brak pasujących rozmów.</p>}</div></aside>
    {selected ? <section className="admin-thread"><header><div className="admin-thread__person"><i>{selected.customer_name.slice(0, 1)}</i><span><strong>{selected.customer_name}</strong><small>{selected.customer_email}</small></span></div><div className="admin-thread__context"><span>{selected.project_number}</span><strong>{selected.project_title || "Rozmowa ogólna"}</strong></div><button type="button">•••</button></header><div className="admin-thread__messages">{selected.messages.map((message) => <article key={message.id} className={`admin-chat-message admin-chat-message--${message.sender}`}><span>{message.sender_name}</span><p>{message.body}</p><time>{time(message.created_at)}</time></article>)}</div><form onSubmit={send}><label htmlFor="admin-reply" className="sr-only">Odpowiedź</label><textarea id="admin-reply" rows={3} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Napisz odpowiedź jako YAMURA…" /><div><span>Odpowiedź zostanie dodana tylko do bieżącego podglądu.</span><button type="submit">Wyślij odpowiedź →</button></div></form></section> : <section className="admin-thread admin-thread--empty"><h2>Wybierz rozmowę</h2></section>}
  </div>;
}

"use client";

import { FormEvent, useState } from "react";

type Message = { id: number; from: "team" | "client"; text: string; time: string };
const initial: Message[] = [
  { id: 1, from: "team", text: "Dzień dobry! Tu zespół YAMURA. W czym możemy dziś pomóc?", time: "09:12" },
  { id: 2, from: "client", text: "Czy próbki frontów będą dostępne podczas konsultacji?", time: "09:18" },
  { id: 3, from: "team", text: "Tak, przygotujemy zestaw dopasowany do kierunku projektu. Dodaliśmy tę informację do spotkania.", time: "09:24" },
];

export function CustomerChat() {
  const [messages, setMessages] = useState(initial);
  const [text, setText] = useState("");
  const send = (event: FormEvent) => { event.preventDefault(); const clean = text.trim(); if (!clean) return; setMessages([...messages, { id: Date.now(), from: "client", text: clean, time: new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(new Date()) }]); setText(""); };
  return <div className="customer-chat-layout">
    <aside className="customer-chat-sidebar"><div className="customer-chat-person"><i>Y</i><span><strong>Zespół YAMURA</strong><small><b /> Zwykle odpowiadamy w ciągu 2 godzin</small></span></div><div className="customer-chat-context"><span>Dotyczy projektu</span><strong>YMR/2026/084</strong><button type="button">Zmień projekt</button></div><div className="customer-chat-note"><span className="customer-eyebrow">Pilna sprawa?</span><strong>+48 690 888 235</strong><small>Pon.–pt. 9:00–17:00</small></div></aside>
    <section className="customer-chat-window"><header><div><span className="customer-eyebrow">Rozmowa</span><h2>Zespół YAMURA</h2></div><span>Wersja demonstracyjna</span></header><div className="customer-chat-messages" aria-live="polite">{messages.map((message) => <div key={message.id} className={`customer-message customer-message--${message.from}`}><span>{message.from === "team" ? "YAMURA" : "Ty"}</span><p>{message.text}</p><small>{message.time}</small></div>)}</div><form onSubmit={send}><label htmlFor="chat-message" className="sr-only">Treść wiadomości</label><textarea id="chat-message" value={text} onChange={(e) => setText(e.target.value)} placeholder="Napisz wiadomość…" rows={2} /><button type="submit">Wyślij <span>→</span></button></form></section>
  </div>;
}

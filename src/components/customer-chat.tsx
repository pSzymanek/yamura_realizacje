"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";

export interface ChatProject {
  id: string;
  order_number: string;
  title: string;
}

export interface CustomerChatProps {
  customerName?: string;
  customerEmail?: string;
  projects?: ChatProject[];
}

type Message = { id: number; from: "team" | "client"; text: string; time: string };

export function CustomerChat({
  customerName = "",
  customerEmail = "",
  projects = [],
}: CustomerChatProps) {
  const storageKey = `yamura_chat_${customerEmail || "guest"}`;

  const [selectedProject, setSelectedProject] = useState(
    projects.length > 0 ? projects[0].order_number : "Rozmowa ogólna",
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      from: "team",
      text: `Dzień dobry${customerName ? " " + customerName.split(" ")[0] : ""}! Tu zespół YAMURA. W czym możemy dziś pomóc?`,
      time: "Dziś",
    },
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  const [text, setText] = useState("");

  const send = (event: FormEvent) => {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) return;

    const newMsg: Message = {
      id: Date.now(),
      from: "client",
      text: clean,
      time: new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setText("");
    toast.success("Wiadomość została wysłana.");
  };

  return (
    <div className="customer-chat-layout">
      <aside className="customer-chat-sidebar">
        <div className="customer-chat-person">
          <i>Y</i>
          <span>
            <strong>Zespół YAMURA</strong>
            <small>
              <b /> Zwykle odpowiadamy w ciągu 2 godzin
            </small>
          </span>
        </div>

        <div className="customer-chat-context">
          <span>Dotyczy projektu</span>
          {projects.length > 0 ? (
            <div style={{ marginTop: "6px" }}>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  border: "1px solid #cec4ba",
                  background: "#faf8f5",
                  color: "#171717",
                  borderRadius: "2px",
                }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.order_number}>
                    {p.order_number} · {p.title}
                  </option>
                ))}
                <option value="Rozmowa ogólna">Rozmowa ogólna</option>
              </select>
            </div>
          ) : (
            <div style={{ marginTop: "6px" }}>
              <strong style={{ fontSize: "0.88rem", display: "block" }}>Rozmowa ogólna</strong>
              <small style={{ color: "#817a73", fontSize: "0.74rem", display: "block", marginTop: "2px" }}>
                Brak przypisanych realizacji
              </small>
            </div>
          )}
        </div>

        <div className="customer-chat-note">
          <span className="customer-eyebrow">Pilna sprawa?</span>
          <strong>+48 690 888 235</strong>
          <small>Pon.–pt. 9:00–17:00</small>
        </div>
      </aside>

      <section className="customer-chat-window">
        <header>
          <div>
            <span className="customer-eyebrow">Rozmowa</span>
            <h2>Zespół YAMURA</h2>
          </div>
          <span
            style={{
              color: "#287a4c",
              fontSize: "0.75rem",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#287a4c",
                display: "inline-block",
              }}
            />
            Aktywny kontakt
          </span>
        </header>

        <div className="customer-chat-messages" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`customer-message customer-message--${message.from}`}>
              <span>{message.from === "team" ? "YAMURA" : customerName || "Ty"}</span>
              <p>{message.text}</p>
              <small>{message.time}</small>
            </div>
          ))}
        </div>

        <form onSubmit={send}>
          <label htmlFor="chat-message" className="sr-only">
            Treść wiadomości
          </label>
          <textarea
            id="chat-message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Napisz wiadomość do zespołu YAMURA…"
            rows={2}
          />
          <button type="submit">
            Wyślij <span>→</span>
          </button>
        </form>
      </section>
    </div>
  );
}


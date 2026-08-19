"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { createProjectAction } from "@/lib/actions";
import { PROJECT_STATUSES } from "@/lib/statuses";
import { INITIAL_ACTION_STATE } from "@/lib/types";

export function ProjectForm() {
  const [state, action] = useActionState(createProjectAction, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="card form-card stack stack--large">
      <div className="form-grid">
        <div className="field">
          <label htmlFor="orderNumber">Numer zamówienia</label>
          <input id="orderNumber" name="orderNumber" maxLength={80} required />
        </div>
        <div className="field">
          <label htmlFor="status">Początkowy status</label>
          <select id="status" name="status" defaultValue="accepted" required>
            {PROJECT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field field--wide">
          <label htmlFor="title">Nazwa realizacji</label>
          <input id="title" name="title" maxLength={160} required />
        </div>
        <div className="field">
          <label htmlFor="customerName">Imię lub nazwa klienta</label>
          <input id="customerName" name="customerName" maxLength={160} required />
        </div>
        <div className="field">
          <label htmlFor="customerEmail">Email klienta</label>
          <input
            id="customerEmail"
            name="customerEmail"
            type="email"
            maxLength={254}
            required
          />
        </div>
      </div>
      <FormMessage state={state} />
      <div className="form-actions">
        <SubmitButton pendingText="Tworzenie realizacji…">Utwórz realizację</SubmitButton>
      </div>
    </form>
  );
}

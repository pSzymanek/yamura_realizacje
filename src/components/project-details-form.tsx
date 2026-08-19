"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { updateProjectDetailsAction } from "@/lib/actions";
import { PROJECT_STATUSES } from "@/lib/statuses";
import type { ProjectDetails } from "@/lib/types";
import { INITIAL_ACTION_STATE } from "@/lib/types";

export function ProjectDetailsForm({ project }: { project: ProjectDetails }) {
  const [state, action] = useActionState(
    updateProjectDetailsAction,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={action} className="stack stack--large">
      <input type="hidden" name="projectId" value={project.id} />
      <div className="form-grid">
        <div className="field">
          <label htmlFor="editOrderNumber">Numer zamówienia</label>
          <input
            id="editOrderNumber"
            name="orderNumber"
            defaultValue={project.order_number}
            maxLength={80}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="editStatus">Aktualny status</label>
          <select id="editStatus" name="status" defaultValue={project.status}>
            {PROJECT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field field--wide">
          <label htmlFor="editTitle">Nazwa realizacji</label>
          <input
            id="editTitle"
            name="title"
            defaultValue={project.title}
            maxLength={160}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="editCustomerName">Klient</label>
          <input
            id="editCustomerName"
            name="customerName"
            defaultValue={project.customer_name}
            maxLength={160}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="editCustomerEmail">Email klienta</label>
          <input
            id="editCustomerEmail"
            name="customerEmail"
            type="email"
            defaultValue={project.customer_email}
            maxLength={254}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="editNextStep">Następny krok</label>
          <input
            id="editNextStep"
            name="nextStep"
            defaultValue={project.next_step || ""}
            maxLength={300}
          />
        </div>
        <div className="field">
          <label htmlFor="editNextStepDate">Orientacyjna data</label>
          <input
            id="editNextStepDate"
            name="nextStepDate"
            type="date"
            defaultValue={project.next_step_date || ""}
          />
        </div>
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Zapisywanie…">Zapisz dane</SubmitButton>
    </form>
  );
}

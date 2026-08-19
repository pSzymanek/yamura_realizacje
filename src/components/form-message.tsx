import type { ActionState } from "@/lib/types";

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) return null;

  return (
    <div
      className={`form-message ${state.ok ? "form-message--success" : "form-message--error"}`}
      role={state.ok ? "status" : "alert"}
    >
      <p>{state.message}</p>
      {state.fieldErrors && (
        <ul>
          {Object.entries(state.fieldErrors).flatMap(([field, messages]) =>
            messages.map((message) => <li key={`${field}-${message}`}>{message}</li>),
          )}
        </ul>
      )}
    </div>
  );
}

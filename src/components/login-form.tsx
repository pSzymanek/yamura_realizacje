"use client";

import { useActionState } from "react";

import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { loginAction } from "@/lib/actions";
import { INITIAL_ACTION_STATE } from "@/lib/types";

export function LoginForm() {
  const [state, action] = useActionState(loginAction, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="stack stack--large">
      <div className="field">
        <label htmlFor="email">Email służbowy</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Hasło</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Logowanie…">Zaloguj się</SubmitButton>
    </form>
  );
}

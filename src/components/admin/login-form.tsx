"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type LoginState } from "@/app/admin/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";

const initialState: LoginState = { status: "idle" };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message ? (
        <div
          className="rounded-[12px] border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-ink"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        <FieldError id="email-error" message={state.fieldErrors?.email} />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
        />
        <FieldError id="password-error" message={state.fieldErrors?.password} />
      </div>

      <Button type="submit" className="w-full" loading={isPending}>
        Sign in
      </Button>

      <p className="text-center text-xs text-muted">
        <Link href="/" className="underline underline-offset-4 hover:text-ink">
          Return to the store
        </Link>
      </p>
    </form>
  );
}

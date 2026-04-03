"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { FormState } from "@/lib/form-state";
import { initialFormState } from "@/lib/form-state";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AuthFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  next?: string;
  forgotPasswordHref?: string;
  reassuranceText?: string;
};

export function AuthForm({
  title,
  description,
  submitLabel,
  action,
  next,
  forgotPasswordHref,
  reassuranceText,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full max-w-md rounded-[2rem] p-7 sm:p-8">
      <div className="space-y-2">
        <Logo className="text-sm tracking-[0.14em] text-slate-600" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-base leading-7 text-slate-700">{description}</p>
        {reassuranceText ? (
          <p className="text-sm leading-6 text-slate-600">{reassuranceText}</p>
        ) : null}
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            required
            type="email"
            name="email"
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-base text-slate-900 placeholder:text-slate-500"
            placeholder="you@example.com"
          />
        </label>
        <label className="block space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-700">Password</span>
            {forgotPasswordHref ? (
              <Link href={forgotPasswordHref} className="text-sm font-medium text-primary-700 hover:text-primary-500">
                Forgot password?
              </Link>
            ) : null}
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/92 pr-2">
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              minLength={8}
              className="focus-ring min-h-12 w-full rounded-2xl border-0 bg-transparent px-4 text-base text-slate-900 placeholder:text-slate-500"
              placeholder="At least 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="focus-ring inline-flex min-h-10 items-center justify-center rounded-full px-3 text-sm font-medium text-slate-700 hover:bg-warm-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6",
            state.status === "error" && "bg-danger-100 text-danger-500",
            state.status === "success" && "bg-success-100 text-success-500",
            state.status === "idle" && "hidden",
          )}
        >
          {state.message}
        </div>
        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "Please wait..." : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
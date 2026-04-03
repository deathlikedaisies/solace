"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/actions/auth";
import { initialFormState } from "@/lib/form-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/branding/logo";
import { cn } from "@/lib/utils";

export function PasswordResetRequestForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialFormState,
  );

  return (
    <Card className="w-full max-w-md rounded-[2rem] p-7 sm:p-8">
      <div className="space-y-2">
        <Logo className="text-sm tracking-[0.14em] text-slate-600" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Reset password
        </h1>
        <p className="text-base leading-7 text-slate-700">
          Enter the email you use for Solace and we&apos;ll send you a reset link.
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
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
          {pending ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-5 text-sm leading-6 text-slate-600">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary-700 hover:text-primary-500">
          Back to log in
        </Link>
      </p>
    </Card>
  );
}
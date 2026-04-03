"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ResetPasswordForm() {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"checking" | "ready" | "error" | "success">("checking");
  const [message, setMessage] = useState("Checking your reset link...");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;

    async function checkRecoverySession() {
      const { data } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (data.session) {
        setStatus("ready");
        setMessage("Choose a new password.");
        return;
      }

      setStatus("error");
      setMessage("Open this page from the reset link in your email.");
    }

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || session) {
        setStatus("ready");
        setMessage("Choose a new password.");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setStatus("error");
      setMessage("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Those passwords do not match.");
      return;
    }

    setPending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (error) {
      setStatus("error");
      setMessage("We couldn't update your password just now. Please try the link again.");
      return;
    }

    setStatus("success");
    setMessage("Your password has been updated. You can log in now.");
  }

  return (
    <Card className="w-full max-w-md rounded-[2rem] p-7 sm:p-8">
      <div className="space-y-2">
        <Logo className="text-sm tracking-[0.14em] text-slate-600" />
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Choose a new password
        </h1>
        <p className="text-base leading-7 text-slate-700">{message}</p>
      </div>

      {status === "ready" ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">New password</span>
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-base text-slate-900"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Confirm password</span>
            <input
              required
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-base text-slate-900"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-warm-100"
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>
          <Button className="w-full" type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save new password"}
          </Button>
        </form>
      ) : null}

      {status === "success" ? (
        <div className="mt-6">
          <Link
            href="/login"
            className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-primary-400 px-5 text-sm font-medium text-slate-950 shadow-sm hover:bg-primary-500"
          >
            Back to log in
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
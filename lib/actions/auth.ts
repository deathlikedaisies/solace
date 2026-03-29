"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/form-state";

export async function signInAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = getSafeRedirectTarget(String(formData.get("next") ?? "/dashboard"));

  if (!email || !password) {
    return {
      status: "error",
      message: "Enter both your email and password to continue.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  redirect(next);
}

export async function signUpAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (!email || !password) {
    return {
      status: "error",
      message: "Enter an email and password to create your account.",
    };
  }

  if (password.length < 8) {
    return {
      status: "error",
      message: "Use a password with at least 8 characters.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: origin ? `${origin}/login` : undefined,
    },
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  if (session) {
    redirect("/onboarding");
  }

  return {
    status: "success",
    message:
      "Your account was created. If email confirmation is enabled, check your inbox before logging in.",
  };
}

export async function signOutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

function getSafeRedirectTarget(target: string) {
  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/dashboard";
  }

  return target;
}

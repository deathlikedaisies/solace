"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/form-state";

const defaultAuthRedirectBaseUrl = "https://solace-taper.vercel.app";

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
      message: formatAuthError(error.message, "sign-in"),
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
      emailRedirectTo: `${getAuthRedirectBaseUrl()}/login`,
    },
  });

  if (error) {
    return {
      status: "error",
      message: formatAuthError(error.message, "sign-up"),
    };
  }

  if (session) {
    redirect("/onboarding");
  }

  return {
    status: "success",
    message:
      "Your account was created. If confirmation is enabled, check your inbox for a link back to the live site, then log in.",
  };
}

export async function requestPasswordResetAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      status: "error",
      message: "Enter your email to get a reset link.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAuthRedirectBaseUrl()}/reset-password`,
  });

  if (error) {
    return {
      status: "error",
      message: formatAuthError(error.message, "reset"),
    };
  }

  return {
    status: "success",
    message: "If that email is in Solace, a reset link is on the way.",
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

function getAuthRedirectBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredUrl) {
    const sanitized = sanitizeExternalUrl(configuredUrl);

    if (sanitized) {
      return sanitized;
    }
  }

  return defaultAuthRedirectBaseUrl;
}

function sanitizeExternalUrl(value: string) {
  try {
    const url = new URL(value);

    if (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname.endsWith(".local")
    ) {
      return null;
    }

    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function formatAuthError(message: string, mode: "sign-in" | "sign-up" | "reset") {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "Too many email attempts were sent just now. Please wait a minute, then try again.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Check your inbox and confirm your email before logging in.";
  }

  if (normalized.includes("user already registered")) {
    return mode === "sign-up"
      ? "This email already has an account. Try logging in instead."
      : "This email already has an account. Try logging in.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "That email and password did not match. Try again.";
  }

  if (mode === "reset") {
    return "We couldn't send a reset link right now. Please try again in a minute.";
  }

  return message;
}
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { ensureInitialDoseEvent } from "@/lib/dose-events";
import type { FormState } from "@/lib/form-state";

export async function saveOnboardingAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/onboarding");
  const benzoName = String(formData.get("benzoName") ?? "").trim();
  const currentDose = Number(formData.get("currentDose") ?? 0);
  const taperStartDate = String(formData.get("taperStartDate") ?? "");
  const nextPath = getSafeNextPath(String(formData.get("nextPath") ?? "/dashboard"));
  const supabase = await createServerSupabaseClient();

  if (!benzoName || !taperStartDate || currentDose <= 0) {
    return {
      status: "error",
      message: "Add your medication, current dose, and start date.",
    };
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("starting_dose")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    return {
      status: "error",
      message: existingProfileError.message,
    };
  }

  const startingDose = existingProfile?.starting_dose ?? currentDose;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      benzo_name: benzoName,
      starting_dose: startingDose,
      current_dose: currentDose,
      taper_start_date: taperStartDate,
    },
    { onConflict: "id" },
  );

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  try {
    await ensureInitialDoseEvent({
      userId: user.id,
      eventDate: taperStartDate,
      dose: startingDose,
    });
  } catch {
    revalidatePath("/onboarding");
    revalidatePath("/dashboard");
    revalidatePath("/timeline");
    revalidatePath("/log");

    return {
      status: "error",
      message:
        "Your medication details were saved, but the timeline may take a moment to catch up.",
    };
  }

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  revalidatePath("/log");
  redirect(nextPath);
}

function getSafeNextPath(target: string) {
  if (!target.startsWith("/") || target.startsWith("//")) {
    return "/dashboard";
  }

  return target;
}

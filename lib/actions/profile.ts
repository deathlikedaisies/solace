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
  const startingDose = Number(formData.get("startingDose") ?? 0);
  const currentDose = Number(formData.get("currentDose") ?? 0);
  const taperStartDate = String(formData.get("taperStartDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!benzoName || !taperStartDate || startingDose <= 0 || currentDose <= 0) {
    return {
      status: "error",
      message:
        "Add your medication, taper starting dose, current dose, and taper start date.",
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      benzo_name: benzoName,
      starting_dose: startingDose,
      current_dose: currentDose,
      taper_start_date: taperStartDate,
      notes,
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
    revalidatePath("/");

    return {
      status: "error",
      message:
        "Your taper setup was saved, but we couldn't update the timeline right now.",
    };
  }

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  revalidatePath("/timeline");
  revalidatePath("/");
  redirect("/dashboard");
}

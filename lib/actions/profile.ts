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
  const dose = Number(formData.get("currentDose") ?? 0);
  const taperStartDate = String(formData.get("taperStartDate") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!benzoName || !taperStartDate || dose <= 0) {
    return {
      status: "error",
      message: "Add your medication, current dose, and taper start date.",
    };
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      benzo_name: benzoName,
      current_dose: dose,
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
      dose,
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

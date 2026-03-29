"use server";

import { revalidatePath } from "next/cache";
import { severeSymptoms } from "@/lib/constants";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { syncDoseEventForDailyLog } from "@/lib/dose-events";
import type { FormState } from "@/lib/form-state";

export async function saveDailyCheckInAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/log");
  const supabase = await createServerSupabaseClient();

  const logDate = String(formData.get("logDate") ?? "");
  const dose = Number(formData.get("dose") ?? 0);
  const anxiety = Number(formData.get("anxiety") ?? 0);
  const mood = Number(formData.get("mood") ?? 0);
  const sleepQuality = Number(formData.get("sleepQuality") ?? 0);
  const sleepHours = Number(formData.get("sleepHours") ?? 0);
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const symptomPayload = String(formData.get("symptoms") ?? "[]");

  let symptoms: string[] = [];

  try {
    symptoms = JSON.parse(symptomPayload) as string[];
  } catch {
    symptoms = [];
  }

  if (!logDate || dose <= 0) {
    return {
      status: "error",
      message: "Add a valid date and dose before saving your check-in.",
    };
  }

  const severeFlag =
    anxiety >= 9 ||
    mood <= 2 ||
    sleepQuality <= 2 ||
    sleepHours <= 3 ||
    symptoms.some((symptom) =>
      severeSymptoms.includes(symptom as (typeof severeSymptoms)[number]),
    );

  const { data: savedLog, error } = await supabase
    .from("daily_logs")
    .upsert(
      {
        user_id: user.id,
        log_date: logDate,
        dose,
        anxiety,
        mood,
        sleep_quality: sleepQuality,
        sleep_hours: sleepHours,
        symptoms,
        notes,
        severe_flag: severeFlag,
      },
      { onConflict: "user_id,log_date" },
    )
    .select("id")
    .single();

  if (error || !savedLog) {
    return {
      status: "error",
      message: error?.message ?? "Unable to save your check-in right now.",
    };
  }

  let postSaveMessage: string | null = null;

  try {
    await syncDoseEventForDailyLog({
      userId: user.id,
      logId: savedLog.id,
      logDate,
      dose,
    });
  } catch {
    postSaveMessage =
      "Your check-in was saved, but we couldn't update the timeline right now.";
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ current_dose: dose })
    .eq("id", user.id);

  if (profileUpdateError) {
    postSaveMessage =
      "Your check-in was saved, but we couldn't refresh your current dose everywhere yet.";
  }

  revalidatePath("/dashboard");
  revalidatePath("/log");
  revalidatePath("/journal");
  revalidatePath("/timeline");

  if (postSaveMessage) {
    return {
      status: "error",
      message: postSaveMessage,
    };
  }

  return {
    status: "success",
    message: "Today's check-in was saved.",
  };
}

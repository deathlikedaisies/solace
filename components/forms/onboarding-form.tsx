"use client";

import { useActionState, useState } from "react";
import { saveOnboardingAction } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/form-state";
import type { Database } from "@/lib/database.types";
import { benzodiazepineOptions, isKnownBenzodiazepine } from "@/lib/benzodiazepines";
import { ApproximateDoseReferenceTool } from "@/components/dose/approximate-dose-reference-tool";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type OnboardingFormProps = {
  profile: Profile | null;
  nextPath?: string;
};

const otherMedication = "Other / not listed";

export function OnboardingForm({
  profile,
  nextPath = "/dashboard",
}: OnboardingFormProps) {
  const [state, formAction, pending] = useActionState(
    saveOnboardingAction,
    initialFormState,
  );
  const [benzoName, setBenzoName] = useState<string>(
    profile?.benzo_name && isKnownBenzodiazepine(profile.benzo_name)
      ? profile.benzo_name
      : otherMedication,
  );
  const currentDose = profile?.current_dose ?? "";

  return (
    <Card className="rounded-[2rem] p-6 sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Add your medication when you&apos;re ready.
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-700">
          These details help keep your notes and dose changes in one place.
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-6">
        <input type="hidden" name="nextPath" value={nextPath} />

        <label className="block space-y-2">
          <span className="text-base font-medium text-slate-800">Medication</span>
          <select
            required
            name="benzoName"
            value={benzoName}
            onChange={(event) => setBenzoName(event.target.value)}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base text-slate-900"
          >
            {benzodiazepineOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-2">
          <label className="block space-y-2">
            <span className="text-base font-medium text-slate-800">Current dose (mg)</span>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              name="currentDose"
              defaultValue={currentDose}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base text-slate-900"
              placeholder="0.50"
            />
          </label>
          <ApproximateDoseReferenceTool
            defaultMedication={benzoName}
            defaultDose={currentDose}
          />
        </div>

        <label className="block space-y-2">
          <span className="text-base font-medium text-slate-800">When did your taper begin?</span>
          <input
            required
            type="date"
            name="taperStartDate"
            defaultValue={profile?.taper_start_date ?? ""}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base text-slate-900"
          />
        </label>

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6",
            state.status === "error" && "bg-danger-100 text-danger-500",
            state.status === "idle" && "hidden",
          )}
        >
          {state.message}
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save details"}
        </Button>
      </form>
    </Card>
  );
}

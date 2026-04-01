"use client";

import { useActionState, useState } from "react";
import { saveOnboardingAction } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/form-state";
import type { Database } from "@/lib/database.types";
import { benzodiazepineOptions, isKnownBenzodiazepine } from "@/lib/benzodiazepines";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApproximateDoseReferenceTool } from "@/components/dose/approximate-dose-reference-tool";
import { cn } from "@/lib/utils";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const otherMedication = "Other / not listed";

export function OnboardingForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(
    saveOnboardingAction,
    initialFormState,
  );
  const [benzoName, setBenzoName] = useState<string>(
    profile?.benzo_name && isKnownBenzodiazepine(profile.benzo_name)
      ? profile.benzo_name
      : otherMedication,
  );
  const [currentDose, setCurrentDose] = useState(
    profile?.current_dose ? String(profile.current_dose) : "",
  );

  return (
    <Card className="rounded-[2rem] p-6 sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Set up your taper snapshot
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">
          Add where your taper started and where you are now so the charts and
          timeline can show the bigger picture instead of only today.
        </p>
      </div>

      <form action={formAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-1">
          <span className="text-sm font-medium text-slate-700">Medication</span>
          <select
            required
            name="benzoName"
            value={benzoName}
            onChange={(event) => setBenzoName(event.target.value)}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900"
          >
            {benzodiazepineOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 sm:col-span-1">
          <span className="text-sm font-medium text-slate-700">
            Taper starting dose (mg)
          </span>
          <input
            required
            min="0.01"
            step="0.01"
            type="number"
            name="startingDose"
            defaultValue={profile?.starting_dose ?? profile?.current_dose ?? ""}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900"
            placeholder="10"
          />
        </label>
        <div className="space-y-2 sm:col-span-1">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Current dose (mg)</span>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              name="currentDose"
              value={currentDose}
              onChange={(event) => setCurrentDose(event.target.value)}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900"
              placeholder="0.50"
            />
          </label>
          <ApproximateDoseReferenceTool
            defaultMedication={benzoName}
            defaultDose={currentDose}
          />
        </div>
        <label className="space-y-2 sm:col-span-1">
          <span className="text-sm font-medium text-slate-700">Taper start date</span>
          <input
            required
            type="date"
            name="taperStartDate"
            defaultValue={profile?.taper_start_date ?? ""}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm text-slate-900"
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Notes (optional)</span>
          <textarea
            name="notes"
            rows={5}
            defaultValue={profile?.notes ?? ""}
            className="focus-ring w-full rounded-[1.5rem] border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900"
            placeholder="Anything you want to remember about your taper context."
          />
        </label>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm sm:col-span-2",
            state.status === "error" && "bg-danger-100 text-danger-500",
            state.status === "idle" && "hidden",
          )}
        >
          {state.message}
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save and continue"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
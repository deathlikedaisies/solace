"use client";

import { useActionState, useState } from "react";
import { saveOnboardingAction } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/form-state";
import type { Database } from "@/lib/database.types";
import { benzodiazepineOptions, isKnownBenzodiazepine } from "@/lib/benzodiazepines";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  const currentDose = profile?.current_dose ?? "";
  const startingDose = profile?.starting_dose ?? profile?.current_dose ?? "";

  return (
    <Card className="rounded-[2rem] p-6 sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Start with a few basics
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-700">
          This gives Solace a starting point. You can add the rest as you go.
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-6">
        <section className="space-y-3 rounded-[1.75rem] bg-white/75 p-5">
          <p className="text-sm font-medium text-slate-500">Step 1</p>
          <label className="space-y-2">
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
        </section>

        <section className="space-y-3 rounded-[1.75rem] bg-white/75 p-5">
          <p className="text-sm font-medium text-slate-500">Step 2</p>
          <label className="space-y-2">
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
        </section>

        <section className="space-y-4 rounded-[1.75rem] bg-white/75 p-5">
          <p className="text-sm font-medium text-slate-500">Step 3</p>
          <label className="space-y-2">
            <span className="text-base font-medium text-slate-800">When did your taper begin?</span>
            <input
              required
              type="date"
              name="taperStartDate"
              defaultValue={profile?.taper_start_date ?? ""}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base text-slate-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Dose when taper began (mg)</span>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              name="startingDose"
              defaultValue={startingDose}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/90 px-4 text-base text-slate-900"
              placeholder="10"
            />
          </label>
        </section>

        <label className="space-y-2 block">
          <span className="text-sm font-medium text-slate-700">Notes (optional)</span>
          <textarea
            name="notes"
            rows={4}
            defaultValue={profile?.notes ?? ""}
            className="focus-ring w-full rounded-[1.5rem] border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900"
            placeholder="Anything you want to remember about where things stand right now."
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
          {pending ? "Saving..." : "Save and continue"}
        </Button>
      </form>
    </Card>
  );
}
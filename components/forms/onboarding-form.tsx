"use client";

import { useActionState } from "react";
import { saveOnboardingAction } from "@/lib/actions/profile";
import { initialFormState } from "@/lib/form-state";
import type { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function OnboardingForm({ profile }: { profile: Profile | null }) {
  const [state, formAction, pending] = useActionState(
    saveOnboardingAction,
    initialFormState,
  );

  return (
    <Card className="rounded-[2rem] p-6 sm:p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Set up your taper snapshot
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-slate-500">
          This helps Solace prefill your daily check-ins and build a clear
          timeline from the start.
        </p>
      </div>

      <form action={formAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-1">
          <span className="text-sm font-medium text-slate-700">Benzo name</span>
          <input
            required
            type="text"
            name="benzoName"
            defaultValue={profile?.benzo_name ?? ""}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
            placeholder="e.g. Diazepam"
          />
        </label>
        <label className="space-y-2 sm:col-span-1">
          <span className="text-sm font-medium text-slate-700">Current dose (mg)</span>
          <input
            required
            min="0.01"
            step="0.01"
            type="number"
            name="currentDose"
            defaultValue={profile?.current_dose ?? ""}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
            placeholder="0.50"
          />
        </label>
        <label className="space-y-2 sm:col-span-1">
          <span className="text-sm font-medium text-slate-700">Taper start date</span>
          <input
            required
            type="date"
            name="taperStartDate"
            defaultValue={profile?.taper_start_date ?? ""}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Notes (optional)</span>
          <textarea
            name="notes"
            rows={5}
            defaultValue={profile?.notes ?? ""}
            className="focus-ring w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-sm"
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


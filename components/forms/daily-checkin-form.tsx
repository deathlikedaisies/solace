"use client";

import { useActionState, useState } from "react";
import { ButtonLink, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveDailyCheckInAction } from "@/lib/actions/logs";
import { initialFormState } from "@/lib/form-state";
import { safetyPrompt, severeSymptoms, symptomOptions } from "@/lib/constants";
import type { Database } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];

type DailyCheckInFormProps = {
  profileDose: number;
  initialLog: DailyLog | null;
  today: string;
};

export function DailyCheckInForm({
  profileDose,
  initialLog,
  today,
}: DailyCheckInFormProps) {
  const [state, formAction, pending] = useActionState(
    saveDailyCheckInAction,
    initialFormState,
  );
  const [anxiety, setAnxiety] = useState(initialLog?.anxiety ?? 4);
  const [mood, setMood] = useState(initialLog?.mood ?? 5);
  const [sleepQuality, setSleepQuality] = useState(initialLog?.sleep_quality ?? 5);
  const [symptoms, setSymptoms] = useState<string[]>(initialLog?.symptoms ?? []);

  const isSevere =
    anxiety >= 9 ||
    mood <= 2 ||
    sleepQuality <= 2 ||
    symptoms.some((symptom) =>
      severeSymptoms.includes(symptom as (typeof severeSymptoms)[number]),
    );

  return (
    <Card className="rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Daily check-in
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Save today&apos;s dose and symptoms in under a minute.
          </p>
        </div>
        {initialLog ? (
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-slate-700">
            Updating today&apos;s entry
          </span>
        ) : null}
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="symptoms" value={JSON.stringify(symptoms)} />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Date</span>
            <input
              required
              type="date"
              name="logDate"
              defaultValue={initialLog?.log_date ?? today}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-sm text-slate-900"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Dose (mg)</span>
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              name="dose"
              defaultValue={initialLog?.dose ?? profileDose}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-sm text-slate-900"
            />
          </label>
          <ScoreField
            label="Anxiety"
            name="anxiety"
            value={anxiety}
            onChange={setAnxiety}
          />
          <ScoreField label="Mood" name="mood" value={mood} onChange={setMood} />
          <ScoreField
            label="Sleep quality"
            name="sleepQuality"
            value={sleepQuality}
            onChange={setSleepQuality}
          />
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Sleep hours</span>
            <input
              required
              min="0"
              max="24"
              step="0.5"
              type="number"
              name="sleepHours"
              defaultValue={initialLog?.sleep_hours ?? 7}
              className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-sm text-slate-900"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-slate-700">Symptoms</h3>
            <p className="text-xs leading-5 text-slate-500">
              Tap all that feel relevant today.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((symptom) => {
              const active = symptoms.includes(symptom);

              return (
                <button
                  key={symptom}
                  type="button"
                  onClick={() =>
                    setSymptoms((current) =>
                      current.includes(symptom)
                        ? current.filter((item) => item !== symptom)
                        : [...current, symptom],
                    )
                  }
                  className={cn(
                    "focus-ring rounded-full border px-4 py-2 text-sm",
                    active
                      ? "border-primary-300 bg-primary-100 text-slate-900"
                      : "border-slate-200 bg-white/90 text-slate-700 hover:border-primary-200",
                  )}
                >
                  {symptom}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Notes</span>
          <textarea
            rows={4}
            name="notes"
            defaultValue={initialLog?.notes ?? ""}
            className="focus-ring w-full rounded-[1.5rem] border border-slate-200 bg-white/92 px-4 py-3 text-sm text-slate-900"
            placeholder="Anything you want future-you to notice."
          />
        </label>

        {isSevere ? (
          <div className="rounded-[1.5rem] border border-danger-500/20 bg-danger-100 px-4 py-3 text-sm leading-6 text-danger-500">
            {safetyPrompt}
          </div>
        ) : null}

        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            state.status === "error" && "bg-danger-100 text-danger-500",
            state.status === "success" && "bg-success-100 text-success-500",
            state.status === "idle" && "hidden",
          )}
        >
          {state.message}
        </div>

        {state.status === "success" ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/timeline" variant="secondary">
              View timeline
            </ButtonLink>
          </div>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save check-in"}
        </Button>
      </form>
    </Card>
  );
}

type ScoreFieldProps = {
  label: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
};

function ScoreField({ label, name, value, onChange }: ScoreFieldProps) {
  return (
    <label className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="rounded-full bg-warm-100 px-3 py-1 text-xs font-medium text-slate-600">
          {value}/10
        </span>
      </div>
      <input
        name={name}
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </label>
  );
}


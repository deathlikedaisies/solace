"use client";

import { useActionState, useMemo, useState } from "react";
import { ButtonLink, Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApproximateDoseReferenceTool } from "@/components/dose/approximate-dose-reference-tool";
import { saveDailyCheckInAction } from "@/lib/actions/logs";
import { initialFormState } from "@/lib/form-state";
import {
  safetyPrompt,
  severeSymptoms,
  symptomGroups,
  symptomLabels,
} from "@/lib/constants";
import type { Database } from "@/lib/database.types";
import { cn, describeRelativeDate, shiftIsoDate } from "@/lib/utils";

type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];

const defaultSuccessMessage = "You can come back later if anything changes.";
const commonSymptoms = new Set<string>([
  "Irritability",
  "Headache",
  "Muscle tension",
  "Fatigue",
  "Insomnia",
  "Dizziness",
  "GI upset",
  "Intrusive thoughts",
]);
const quickPresets = [
  { label: "Calm", anxiety: 2, mood: 7, sleepQuality: 7 },
  { label: "Okay", anxiety: 4, mood: 5, sleepQuality: 5 },
  { label: "Rough", anxiety: 6, mood: 4, sleepQuality: 4 },
  { label: "Very difficult", anxiety: 8, mood: 2, sleepQuality: 2 },
] as const;

type DailyCheckInFormProps = {
  profileDose: number;
  profileMedication: string;
  initialDate: string;
  initialLog: DailyLog | null;
  logs: DailyLog[];
  today: string;
};

type DraftValues = {
  dose: number;
  anxiety: number;
  mood: number;
  sleepQuality: number;
  sleepHours: number;
  symptoms: string[];
  notes: string;
};

export function DailyCheckInForm({
  profileDose,
  profileMedication,
  initialDate,
  initialLog,
  logs,
  today,
}: DailyCheckInFormProps) {
  const [state, formAction, pending] = useActionState(
    saveDailyCheckInAction,
    initialFormState,
  );
  const logsByDate = useMemo(
    () => Object.fromEntries(logs.map((log) => [log.log_date, log])),
    [logs],
  );
  const initialDraft = buildDraft(initialLog, profileDose);
  const [logDate, setLogDate] = useState(initialLog?.log_date ?? initialDate);
  const [dose, setDose] = useState(initialDraft.dose);
  const [anxiety, setAnxiety] = useState(initialDraft.anxiety);
  const [mood, setMood] = useState(initialDraft.mood);
  const [sleepQuality, setSleepQuality] = useState(initialDraft.sleepQuality);
  const [sleepHours, setSleepHours] = useState(initialDraft.sleepHours);
  const [symptoms, setSymptoms] = useState<string[]>(initialDraft.symptoms);
  const [notes, setNotes] = useState(initialDraft.notes);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const selectedLog = logsByDate[logDate] ?? null;
  const yesterday = shiftIsoDate(today, -1);
  const isToday = logDate === today;
  const relativeDate = describeRelativeDate(logDate, today);
  const visibleGroups = symptomGroups
    .map((group) => ({
      ...group,
      symptoms: showAllSymptoms
        ? group.symptoms
        : group.symptoms.filter(
            (symptom) => commonSymptoms.has(symptom) || symptoms.includes(symptom),
          ),
    }))
    .filter((group) => group.symptoms.length > 0);
  const isSevere =
    anxiety >= 9 ||
    mood <= 2 ||
    sleepQuality <= 2 ||
    sleepHours <= 3 ||
    symptoms.some((symptom) =>
      severeSymptoms.includes(symptom as (typeof severeSymptoms)[number]),
    );

  function loadDate(nextDate: string) {
    const nextLog = logsByDate[nextDate] ?? null;
    const nextDraft = buildDraft(nextLog, profileDose);

    setLogDate(nextDate);
    setDose(nextDraft.dose);
    setAnxiety(nextDraft.anxiety);
    setMood(nextDraft.mood);
    setSleepQuality(nextDraft.sleepQuality);
    setSleepHours(nextDraft.sleepHours);
    setSymptoms(nextDraft.symptoms);
    setNotes(nextDraft.notes);
    setSelectedPreset(null);
  }

  function applyQuickPreset(preset: (typeof quickPresets)[number]) {
    setAnxiety(preset.anxiety);
    setMood(preset.mood);
    setSleepQuality(preset.sleepQuality);
    setSelectedPreset(preset.label);
  }

  if (state.status === "success") {
    return (
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <div className="rounded-[1.75rem] border border-success-500/15 bg-success-100/85 px-5 py-6 text-success-500">
          <p className="text-base font-semibold text-slate-900">Saved for {relativeDate}.</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            You can come back later if anything changes.
          </p>
          {state.message !== defaultSuccessMessage ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{state.message}</p>
          ) : null}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/timeline">View timeline</ButtonLink>
            <ButtonLink href="/dashboard" variant="secondary">
              Back to dashboard
            </ButtonLink>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[1.85rem] font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Daily check-in
          </h2>
          <p className="mt-1 text-base leading-7 text-slate-700">
            A brief note for {relativeDate}.
          </p>
        </div>
        {selectedLog ? (
          <span className="rounded-full bg-primary-100 px-3 py-1.5 text-sm font-medium text-slate-800">
            Updating this day&apos;s note
          </span>
        ) : null}
      </div>

      <form action={formAction} className="mt-8 space-y-8">
        <input type="hidden" name="symptoms" value={JSON.stringify(symptoms)} />

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-slate-800">Today felt</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Pick the closest starting point, then adjust anything that needs it.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {quickPresets.map((preset) => {
              const active = selectedPreset === preset.label;

              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyQuickPreset(preset)}
                  className={cn(
                    "focus-ring min-h-12 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition",
                    active
                      ? "border-primary-300 bg-primary-100 text-slate-900"
                      : "border-slate-200 bg-white/92 text-slate-800 hover:border-primary-200",
                  )}
                  aria-pressed={active}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm leading-6 text-slate-600">
            {selectedPreset
              ? `${selectedPreset} selected. Anxiety, mood, and sleep quality were updated below.`
              : "This sets anxiety, mood, and sleep quality as a starting point."}
          </p>
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="text-base font-medium text-slate-800">Date and dose</h3>
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadDate(today)}
                className={cn(
                  "focus-ring min-h-12 rounded-full border px-4 py-2 text-sm font-medium",
                  isToday
                    ? "border-primary-300 bg-primary-100 text-slate-900"
                    : "border-slate-200 bg-white/92 text-slate-700 hover:border-primary-200",
                )}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => loadDate(yesterday)}
                className={cn(
                  "focus-ring min-h-12 rounded-full border px-4 py-2 text-sm font-medium",
                  logDate === yesterday
                    ? "border-primary-300 bg-primary-100 text-slate-900"
                    : "border-slate-200 bg-white/92 text-slate-700 hover:border-primary-200",
                )}
              >
                Yesterday
              </button>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              Switching dates loads that day&apos;s note if one is already there.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Date</span>
              <input
                required
                type="date"
                name="logDate"
                value={logDate}
                onChange={(event) => loadDate(event.target.value)}
                className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-base text-slate-900"
              />
            </label>
            <div className="space-y-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Dose (mg)</span>
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  name="dose"
                  value={dose}
                  onChange={(event) => setDose(Number(event.target.value))}
                  className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-base text-slate-900"
                />
              </label>
              <ApproximateDoseReferenceTool
                defaultMedication={profileMedication}
                defaultDose={dose}
              />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h3 className="text-base font-medium text-slate-800">How today felt</h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <ScoreField
              label="Anxiety"
              name="anxiety"
              value={anxiety}
              onChange={(nextValue) => {
                setAnxiety(nextValue);
                setSelectedPreset(null);
              }}
            />
            <ScoreField
              label="Mood"
              name="mood"
              value={mood}
              onChange={(nextValue) => {
                setMood(nextValue);
                setSelectedPreset(null);
              }}
            />
            <ScoreField
              label="Sleep quality"
              name="sleepQuality"
              value={sleepQuality}
              onChange={(nextValue) => {
                setSleepQuality(nextValue);
                setSelectedPreset(null);
              }}
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
                value={sleepHours}
                onChange={(event) => setSleepHours(Number(event.target.value))}
                className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-base text-slate-900"
              />
            </label>
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-slate-800">Symptoms</h3>
            <p className="text-sm leading-6 text-slate-600">
              Start with the most common ones. You can open the full list if you need it.
            </p>
          </div>
          <div className="space-y-7">
            {visibleGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <p className="text-sm font-medium text-slate-600">{group.title}</p>
                <div className="flex flex-wrap gap-2.5">
                  {group.symptoms.map((symptom) => {
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
                          "focus-ring min-h-12 rounded-full border px-4 py-2 text-sm font-medium",
                          active
                            ? "border-primary-300 bg-primary-100 text-slate-900"
                            : "border-slate-200 bg-white/90 text-slate-700 hover:border-primary-200",
                        )}
                      >
                        {symptomLabels[symptom]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAllSymptoms((current) => !current)}
            className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white/92 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-warm-100"
          >
            {showAllSymptoms ? "Show fewer symptoms" : "Show more symptoms"}
          </button>
        </section>

        <section className="space-y-2">
          <label className="block space-y-2">
            <span className="text-base font-medium text-slate-800">Notes</span>
            <textarea
              rows={4}
              name="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="focus-ring w-full rounded-[1.5rem] border border-slate-200 bg-white/92 px-4 py-3 text-base text-slate-900"
              placeholder="Anything you want to remember later."
            />
          </label>
        </section>

        {isSevere ? (
          <div className="rounded-[1.5rem] border border-danger-500/20 bg-danger-100 px-4 py-3 text-sm leading-6 text-danger-500">
            {safetyPrompt}
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="rounded-[1.5rem] bg-danger-100 px-4 py-3 text-sm leading-6 text-danger-500">
            {state.message}
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
  const decrease = () => onChange(clampScore(value - 1));
  const increase = () => onChange(clampScore(value + 1));

  return (
    <label className="space-y-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={decrease}
          className="focus-ring inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-slate-200 bg-white/92 text-lg font-medium text-slate-800 hover:bg-warm-100"
          aria-label={`Lower ${label}`}
        >
          -
        </button>
        <input
          name={name}
          type="number"
          min="0"
          max="10"
          step="1"
          inputMode="numeric"
          value={value}
          onChange={(event) => onChange(clampScore(Number(event.target.value)))}
          className="focus-ring min-h-12 w-28 rounded-2xl border border-slate-200 bg-white/92 px-4 text-center text-base font-medium text-slate-900"
          aria-label={`${label} score`}
        />
        <span className="text-sm text-slate-600">/ 10</span>
        <button
          type="button"
          onClick={increase}
          className="focus-ring inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-slate-200 bg-white/92 text-lg font-medium text-slate-800 hover:bg-warm-100"
          aria-label={`Raise ${label}`}
        >
          +
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
        aria-label={`${label} slider`}
      />
    </label>
  );
}

function clampScore(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(10, value));
}

function buildDraft(log: DailyLog | null, profileDose: number): DraftValues {
  return {
    dose: log?.dose ?? profileDose,
    anxiety: log?.anxiety ?? 4,
    mood: log?.mood ?? 5,
    sleepQuality: log?.sleep_quality ?? 5,
    sleepHours: log?.sleep_hours ?? 7,
    symptoms: log?.symptoms ?? [],
    notes: log?.notes ?? "",
  };
}
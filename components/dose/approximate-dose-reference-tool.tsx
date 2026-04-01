"use client";

import { useMemo, useState } from "react";
import {
  benzodiazepineOptions,
  getApproximateDiazepamEquivalent,
  isKnownBenzodiazepine,
} from "@/lib/benzodiazepines";
import { cn } from "@/lib/utils";

type ApproximateDoseReferenceToolProps = {
  defaultMedication?: string | null;
  defaultDose?: number | string | null;
  className?: string;
  triggerLabel?: string;
};

const otherMedication = "Other / not listed";

export function ApproximateDoseReferenceTool({
  defaultMedication,
  defaultDose,
  className,
  triggerLabel = "Check approximate equivalence",
}: ApproximateDoseReferenceToolProps) {
  const [open, setOpen] = useState(false);
  const [medication, setMedication] = useState<string>(resolveMedication(defaultMedication));
  const [dose, setDose] = useState(resolveDose(defaultDose));

  const estimate = useMemo(
    () => getApproximateDiazepamEquivalent(medication, dose ? Number(dose) : null),
    [medication, dose],
  );

  function handleOpen() {
    const nextMedication = resolveMedication(defaultMedication);
    const nextDose = resolveDose(defaultDose);

    setMedication(nextMedication);
    setDose(nextDose);
    setOpen((current) => !current);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <button
        type="button"
        onClick={handleOpen}
        className="focus-ring inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white/85 px-4 text-sm font-medium text-slate-700 hover:bg-warm-100"
      >
        {triggerLabel}
      </button>

      {open ? (
        <div className="rounded-[1.5rem] bg-primary-50/80 px-4 py-4">
          <div className="space-y-1">
            <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">
              Approximate dose reference
            </p>
            <p className="text-sm leading-6 text-slate-600">
              A rough diazepam comparison for context only.
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Medication</span>
              <select
                value={medication}
                onChange={(event) => setMedication(event.target.value)}
                className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-sm text-slate-900"
              >
                {benzodiazepineOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Dose (mg)</span>
              <input
                min="0.01"
                step="0.01"
                type="number"
                value={dose}
                onChange={(event) => setDose(event.target.value)}
                className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white/92 px-4 text-sm text-slate-900"
                placeholder="0.50"
              />
            </label>
          </div>

          <div className="mt-4 rounded-[1.25rem] bg-white/88 px-4 py-3 text-sm leading-6 text-slate-700">
            {renderMessage(medication, dose, estimate)}
          </div>

          <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
            <p>Approximate only. Different sources use slightly different estimates.</p>
            <p>
              Individual response varies. Do not use this alone to change your medication.
              Review medication changes with your clinician.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function resolveMedication(value: string | null | undefined) {
  if (value && isKnownBenzodiazepine(value)) {
    return value;
  }

  return otherMedication;
}

function resolveDose(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  return String(value);
}

function renderMessage(
  medication: string,
  dose: string,
  estimate: ReturnType<typeof getApproximateDiazepamEquivalent>,
) {
  if (!dose) {
    return "Add a dose to see an approximate reference.";
  }

  if (medication === otherMedication) {
    return "An approximate reference is not available for this medication.";
  }

  if (!estimate) {
    return "An approximate reference is not available for this medication.";
  }

  if (estimate.kind === "diazepam") {
    return "You are already logging diazepam, so no conversion is needed.";
  }

  return estimate.summary.replace("Your current dose is ", "");
}
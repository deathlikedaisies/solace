"use client";

import { useState } from "react";
import type { DoctorVisitSummary } from "@/lib/doctor-visit-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type DoctorVisitSummaryPanelProps = {
  summary: DoctorVisitSummary;
};

export function DoctorVisitSummaryPanel({ summary }: DoctorVisitSummaryPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summary.text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <Card className="rounded-[2rem] p-6 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
            Appointment
          </p>
          <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight text-slate-900">
            Pull your recent notes into one place.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            A plain-language summary you can copy into notes or bring into the room.
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => setExpanded(true)}>
          Prepare for appointment
        </Button>
      </div>

      {expanded ? (
        <div className="mt-6 space-y-5">
          {summary.sections.map((section) => (
            <div key={section.title} className="rounded-[1.5rem] bg-warm-100/90 px-4 py-4">
              <p className="text-sm font-medium text-slate-800">{section.title}</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                {section.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ))}

          <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 text-sm leading-6 text-slate-700">
            {summary.disclaimer}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button type="button" onClick={handleCopy}>
              Copy to clipboard
            </Button>
            {copyState === "copied" ? (
              <p className="text-sm text-slate-600">Copied and ready to paste.</p>
            ) : null}
            {copyState === "error" ? (
              <p className="text-sm text-danger-500">Unable to copy right now.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
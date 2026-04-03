"use client";

import Link from "next/link";
import { useState } from "react";
import type { Database } from "@/lib/database.types";
import { getSymptomLabel } from "@/lib/constants";
import { formatDate, formatDose, formatHours } from "@/lib/utils";
import { EmptyState } from "@/components/feedback/empty-state";

type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];

export function JournalHistory({ logs }: { logs: DailyLog[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = logs.filter((log) => {
    if (from && log.log_date < from) {
      return false;
    }

    if (to && log.log_date > to) {
      return false;
    }

    return true;
  });

  if (!logs.length) {
    return (
      <EmptyState
        title="No entries yet"
        description="Your journal starts with the first note you save."
        actionHref="/log"
        actionLabel="Save your first note"
      />
    );
  }

  return (
    <div className="space-y-7">
      <div className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(54,66,82,0.08)] sm:grid-cols-2 lg:grid-cols-[1.15fr_repeat(2,minmax(0,1fr))_auto] lg:items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Saved days
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Choose a stretch of time when you want a little more context.
          </p>
        </div>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">From</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">To</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="focus-ring min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setFrom("");
            setTo("");
          }}
          className="focus-ring min-h-12 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-warm-100"
        >
          Clear filters
        </button>
      </div>

      <div className="space-y-7">
        {filtered.length ? (
          filtered.map((log) => {
            const symptomLine = log.symptoms.length
              ? log.symptoms.map((symptom) => getSymptomLabel(symptom)).join(", ")
              : "None marked";

            return (
              <article
                key={log.id}
                className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(54,66,82,0.08)]"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                    {formatDate(log.log_date)}
                  </h3>
                  {log.severe_flag ? (
                    <span className="rounded-full bg-danger-100 px-3 py-1 text-xs font-medium text-danger-500">
                      Harder day
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 space-y-1 text-base leading-7 text-slate-700">
                  <p><span className="font-medium text-slate-900">Dose</span> {formatDose(log.dose)}</p>
                  <p><span className="font-medium text-slate-900">Anxiety</span> {log.anxiety} / 10</p>
                  <p><span className="font-medium text-slate-900">Mood</span> {log.mood} / 10</p>
                  <p><span className="font-medium text-slate-900">Sleep</span> {formatHours(log.sleep_hours)}</p>
                  <p><span className="font-medium text-slate-900">Sleep quality</span> {log.sleep_quality} / 10</p>
                </div>
                <div className="mt-5 rounded-[1.5rem] bg-primary-50/90 px-4 py-3 text-sm leading-6 text-slate-700">
                  <span className="font-medium text-slate-900">Symptoms:</span> {symptomLine}
                </div>
                {log.notes ? (
                  <div className="mt-4 rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-7 text-slate-700">
                    <p className="font-medium text-slate-900">Note</p>
                    <p className="mt-1">{log.notes}</p>
                  </div>
                ) : null}
              </article>
            );
          })
        ) : (
          <EmptyState
            title="Nothing matches those dates"
            description="Try widening the range or clear the filters to bring the full journal back into view."
            secondaryAction={
              <Link
                href="/log"
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-warm-100"
              >
                Open daily log
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
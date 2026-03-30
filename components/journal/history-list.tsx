"use client";

import Link from "next/link";
import { useState } from "react";
import type { Database } from "@/lib/database.types";
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
    <div className="space-y-6">
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

      <div className="space-y-6">
        {filtered.length ? (
          filtered.map((log) => (
            <article
              key={log.id}
              className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(54,66,82,0.08)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
                    {formatDate(log.log_date)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    Dose {formatDose(log.dose)}. Anxiety {log.anxiety}/10. Mood {log.mood}/10. Sleep {formatHours(log.sleep_hours)}.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {log.symptoms.length
                      ? `${log.symptoms.length} symptom${log.symptoms.length === 1 ? "" : "s"} noted`
                      : "No symptoms marked"}
                  </p>
                </div>
                {log.severe_flag ? (
                  <span className="rounded-full bg-danger-100 px-3 py-1 text-xs font-medium text-danger-500">
                    Harder day
                  </span>
                ) : null}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-100/70 px-2.5 py-1 text-xs text-slate-700">
                  Sleep quality {log.sleep_quality}/10
                </span>
                {log.symptoms.map((symptom) => (
                  <span
                    key={`${log.id}-${symptom}`}
                    className="rounded-full border border-primary-200/60 bg-primary-50/65 px-2.5 py-1 text-xs text-slate-600"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
              {log.notes ? (
                <p className="mt-5 rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-6 text-slate-700">
                  {log.notes}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <EmptyState
            title="Nothing matches those dates"
            description="Try widening the range or clear the filters to bring the full journal back into view."
            secondaryAction={
              <Link
                href="/log"
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-warm-100"
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
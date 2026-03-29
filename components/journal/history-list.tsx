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
        title="No journal entries yet"
        description="Your daily check-ins will start building a quiet history here as soon as you save the first one."
        actionHref="/log"
        actionLabel="Save your first check-in"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(54,66,82,0.08)] sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(2,minmax(0,1fr))_auto] lg:items-end">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Journal history
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Filter by date to review past entries without losing context.
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

      <div className="space-y-4">
        {filtered.length ? (
          filtered.map((log) => (
            <article
              key={log.id}
              className="rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(54,66,82,0.08)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-medium tracking-[0.22em] text-slate-400 uppercase">
                    {formatDate(log.log_date)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-primary-100 px-3 py-1">
                      Dose {formatDose(log.dose)}
                    </span>
                    <span className="rounded-full bg-warm-100 px-3 py-1">
                      Anxiety {log.anxiety}/10
                    </span>
                    <span className="rounded-full bg-warm-100 px-3 py-1">
                      Mood {log.mood}/10
                    </span>
                    <span className="rounded-full bg-warm-100 px-3 py-1">
                      Sleep {formatHours(log.sleep_hours)}
                    </span>
                    <span className="rounded-full bg-warm-100 px-3 py-1">
                      Quality {log.sleep_quality}/10
                    </span>
                  </div>
                </div>
                {log.severe_flag ? (
                  <span className="rounded-full bg-danger-100 px-3 py-1 text-xs font-medium text-danger-500">
                    Safety prompt shown
                  </span>
                ) : null}
              </div>
              {log.symptoms.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {log.symptoms.map((symptom) => (
                    <span
                      key={`${log.id}-${symptom}`}
                      className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs text-slate-700"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              ) : null}
              {log.notes ? (
                <p className="mt-4 rounded-[1.5rem] bg-warm-100 px-4 py-3 text-sm leading-6 text-slate-600">
                  {log.notes}
                </p>
              ) : null}
            </article>
          ))
        ) : (
          <EmptyState
            title="No entries match this range"
            description="Try widening the dates or clear the filters to return to your full journal history."
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

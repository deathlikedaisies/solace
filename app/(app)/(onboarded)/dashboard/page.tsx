import type { ReactNode } from "react";
import { MetricChart } from "@/components/charts/metric-chart";
import { DoctorVisitSummaryPanel } from "@/components/doctor-visit/doctor-visit-summary-panel";
import { EmptyState } from "@/components/feedback/empty-state";
import { ExportLogsButton } from "@/components/export/export-logs-button";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { buildDoctorVisitSummary } from "@/lib/doctor-visit-summary";
import {  describeRelativeDate,
  formatCompactDate,
  formatDate,
  formatDose,
  formatHours,
  formatRelativeDateLabel,
} from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const { profile, logs, latestLog, todayLog, averages, streak, events, insights } =
    await getDashboardData(user.id);

  if (!profile) {
    return null;
  }

  const doctorVisitSummary = buildDoctorVisitSummary(profile, logs);
  const chartData = logs.slice(-21);
  const chartStart = chartData[0]?.log_date;
  const reductionMarkers = events
    .filter((event) => event.event_type === "reduction")
    .filter((event) => !chartStart || event.event_date >= chartStart)
    .map((event) => ({ date: event.event_date, label: "Dose change" }));
  const startingDose = profile.starting_dose ?? profile.current_dose;
  const doseChange = Number((startingDose - profile.current_dose).toFixed(2));
  const previousWeek = logs.slice(-14, -7);
  const previousSymptomAverage = average(previousWeek.map((log) => log.symptoms.length));
  const previousAnxietyAverage = average(previousWeek.map((log) => log.anxiety));
  const previousMoodAverage = average(previousWeek.map((log) => log.mood));
  const symptomCue = getTrendCue(averages.symptomLoad, previousSymptomAverage, {
    lower: "Lighter than last week",
    same: "Holding steady",
    higher: "A bit heavier lately",
  });
  const anxietyCue = getTrendCue(averages.anxiety, previousAnxietyAverage, {
    lower: "A little lower lately",
    same: "Holding steady",
    higher: "A little higher lately",
  });
  const moodCue = getTrendCue(averages.mood, previousMoodAverage, {
    lower: "A little lower lately",
    same: "Holding steady",
    higher: "A little brighter lately",
  });
  const sleepCue = getSleepCue(averages.sleepHours);
  const checkInValue = todayLog
    ? "Today"
    : latestLog
      ? formatRelativeDateLabel(latestLog.log_date)
      : "Open";
  const statusLine = todayLog
    ? "You've checked in today."
    : latestLog
      ? `Last entry: ${describeRelativeDate(latestLog.log_date)}.`
      : "Start with today, or add a recent day you missed.";
  const changeCue = doseChange > 0 ? `Down from ${formatDose(startingDose)}` : "No change today";
  const continuityLine =
    streak > 0
      ? `${streak} day${streak === 1 ? "" : "s"} in a row`
      : latestLog
        ? "Pick up again when you are ready."
        : "The next check-in starts your first run of days.";
  const topInsight = insights[0]?.text ?? continuityLine;

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Card className="rounded-[2rem] p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <h2 className="text-[2rem] font-semibold tracking-tight text-slate-900 sm:text-[2.2rem]">
                {todayLog ? "Today is already noted." : "A quick look at where things stand."}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-slate-700">{statusLine}</p>
              <p className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 text-sm leading-6 text-slate-700">
                {topInsight}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ButtonLink href="/log">
                {todayLog ? "Update today's note" : "Log today"}
              </ButtonLink>
              <ButtonLink href="/journal" variant="secondary">
                Open journal
              </ButtonLink>
              <ExportLogsButton disabled={!logs.length} />
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <SummaryCard
            title="Current dose"
            value={formatDose(profile.current_dose)}
            detail={`${profile.benzo_name} • ${changeCue}`}
            extra={
              <ButtonLink href="/log" variant="secondary" className="mt-4 w-full sm:w-auto">
                View approximate equivalence
              </ButtonLink>
            }
          />
          <SummaryCard
            title={todayLog ? "Today" : "Last entry"}
            value={checkInValue}
            detail={todayLog ? continuityLine : statusLine}
          />
        </div>
      </section>

      {!logs.length ? (
        <EmptyState
          title="Your overview will take shape as you go"
          description="Once you save a daily note, your dose, symptoms, mood, and sleep will start to line up here."
          actionHref="/log"
          actionLabel="Save your first note"
          secondaryAction={<ExportLogsButton disabled />}
        />
      ) : (
        <>
          <section className="space-y-5">
            <div className="space-y-1 px-1">
              <h3 className="text-[1.4rem] font-semibold tracking-tight text-slate-900">
                Recent patterns
              </h3>
              <p className="text-sm leading-6 text-slate-600">
                A simple view of what has been steady and what has shifted.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
              <MetricChart
                title="Dose"
                subtitle={changeCue}
                data={chartData.map((log) => ({ date: log.log_date, value: log.dose }))}
                suffix=" mg"
                markers={reductionMarkers}
              />
              <MetricChart
                title="Symptoms"
                subtitle={symptomCue}
                data={chartData.map((log) => ({
                  date: log.log_date,
                  value: log.symptoms.length,
                }))}
                colorClass="stroke-danger-500"
                markers={reductionMarkers}
              />
              <MetricChart
                title="Anxiety"
                subtitle={anxietyCue}
                data={chartData.map((log) => ({ date: log.log_date, value: log.anxiety }))}
              />
              <MetricChart
                title="Mood"
                subtitle={moodCue}
                data={chartData.map((log) => ({ date: log.log_date, value: log.mood }))}
                colorClass="stroke-lavender-300"
              />
              <MetricChart
                title="Sleep"
                subtitle={sleepCue}
                data={chartData.map((log) => ({ date: log.log_date, value: log.sleep_hours }))}
                colorClass="stroke-secondary-400"
                suffix=" h"
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
            <Card className="rounded-[2rem] p-6 sm:p-7">
              <h3 className="text-[1.45rem] font-semibold tracking-tight text-slate-900">
                Most recent day
              </h3>
              {latestLog ? (
                <div className="mt-5 space-y-3 text-base leading-7 text-slate-700">
                  <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-slate-900">
                    {formatDate(latestLog.log_date)}
                  </div>
                  <div className="rounded-[1.5rem] bg-white/80 px-4 py-4">
                    <p><span className="font-medium text-slate-900">Dose</span> {formatDose(latestLog.dose)}</p>
                    <p><span className="font-medium text-slate-900">Anxiety</span> {latestLog.anxiety}/10</p>
                    <p><span className="font-medium text-slate-900">Mood</span> {latestLog.mood}/10</p>
                    <p><span className="font-medium text-slate-900">Sleep</span> {formatHours(latestLog.sleep_hours)}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 leading-6 text-slate-700">
                    Recent averages: anxiety {averages.anxiety}/10, mood {averages.mood}/10, sleep {formatHours(averages.sleepHours)}, symptoms {averages.symptomLoad}/day.
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-6 text-slate-500">
                  Your most recent day will appear here.
                </p>
              )}
            </Card>

            <Card className="rounded-[2rem] p-6 sm:p-7">
              <h3 className="text-[1.45rem] font-semibold tracking-tight text-slate-900">
                Taper snapshot
              </h3>
              <div className="mt-5 space-y-3 text-base leading-7 text-slate-700">
                <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 text-slate-700">
                  {continuityLine}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  <span className="font-medium text-slate-900">Medication</span> {profile.benzo_name}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  <span className="font-medium text-slate-900">Started from</span> {formatDose(startingDose)}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  <span className="font-medium text-slate-900">Now at</span> {formatDose(profile.current_dose)}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  <span className="font-medium text-slate-900">Taper start</span> {formatCompactDate(profile.taper_start_date)}
                </div>
              </div>
            </Card>
          </section>

          <DoctorVisitSummaryPanel summary={doctorVisitSummary} />
        </>
      )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  detail,
  extra,
}: {
  title: string;
  value: string;
  detail: string;
  extra?: ReactNode;
}) {
  return (
    <Card className="rounded-[1.75rem] p-5 sm:p-6">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="mt-3 text-[1.7rem] font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
      {extra}
    </Card>
  );
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1),
  );
}

function getTrendCue(
  current: number,
  previous: number,
  copy: { lower: string; same: string; higher: string },
) {
  if (!previous) {
    return copy.same;
  }

  if (current <= previous - 0.5) {
    return copy.lower;
  }

  if (current >= previous + 0.5) {
    return copy.higher;
  }

  return copy.same;
}

function getSleepCue(hours: number) {
  if (hours >= 7) {
    return "Holding steady";
  }

  if (hours >= 5.5) {
    return "A little uneven";
  }

  return "Running short lately";
}
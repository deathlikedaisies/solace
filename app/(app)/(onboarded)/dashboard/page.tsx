import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { MetricChart } from "@/components/charts/metric-chart";
import { DoctorVisitSummaryPanel } from "@/components/doctor-visit/doctor-visit-summary-panel";
import { EmptyState } from "@/components/feedback/empty-state";
import { ExportLogsButton } from "@/components/export/export-logs-button";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getDashboardData, hasMedicationDetails } from "@/lib/data";
import { buildDoctorVisitSummary } from "@/lib/doctor-visit-summary";
import {
  describeRelativeDate,
  formatDate,
  formatDose,
  formatHours,
  formatRelativeDateLabel,
} from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const {
    profile,
    logs,
    doseLogs,
    latestLog,
    latestDoseLog,
    todayLog,
    averages,
    streak,
    events,
    insights,
  } = await getDashboardData(user.id);
  const hasMedication = hasMedicationDetails(profile);

  if (!logs.length && !hasMedication) {
    redirect("/onboarding");
  }

  if (!logs.length) {
    return (
      <EmptyState
        title="Start with today"
        description="One brief note is enough to get your timeline and journal started."
        actionHref="/log"
        actionLabel="Open daily log"
        secondaryAction={<ExportLogsButton disabled />}
      />
    );
  }

  const chartData = logs.slice(-21);
  const doseChartData = doseLogs
    .slice(-21)
    .map((log) => ({ date: log.log_date, value: log.dose }));
  const chartStart = doseChartData[0]?.date;
  const reductionMarkers = events
    .filter((event) => event.event_type === "reduction")
    .filter((event) => !chartStart || event.event_date >= chartStart)
    .map((event) => ({ date: event.event_date, label: "Dose change" }));
  const currentDose = profile?.current_dose ?? latestDoseLog?.dose ?? null;
  const startingDose = profile?.starting_dose ?? profile?.current_dose ?? currentDose;
  const doseChange =
    startingDose !== null && currentDose !== null
      ? Number((startingDose - currentDose).toFixed(2))
      : 0;
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
      : "Start with today when you're ready.";
  const changeCue =
    currentDose !== null && doseChange > 0
      ? `Down from ${formatDose(startingDose)}`
      : currentDose !== null
        ? "No change today"
        : "Dose not added yet";
  const continuityLine =
    streak > 0
      ? `${streak} day${streak === 1 ? "" : "s"} in a row`
      : latestLog
        ? "Come back whenever you want to keep going."
        : "Your next check-in starts the first stretch of days.";
  const topInsight = insights[0]?.text ?? continuityLine;
  const primaryAction = !todayLog
    ? { href: "/log", label: "Start with today" }
    : !hasMedication
      ? { href: "/onboarding?step=medication", label: "Add medication" }
      : { href: "/timeline", label: "View timeline" };
  const doctorVisitSummary = profile ? buildDoctorVisitSummary(profile, logs) : null;

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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href={primaryAction.href}>{primaryAction.label}</ButtonLink>
              <ButtonLink href="/journal" variant="secondary">
                Open journal
              </ButtonLink>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <SummaryCard
            title="Current dose"
            value={formatDose(currentDose)}
            detail={
              hasMedication && profile
                ? `${profile.benzo_name} - ${changeCue}`
                : "Add your medication later if you want it here."
            }
            extra={
              !hasMedication ? (
                <ButtonLink
                  href="/onboarding?step=medication"
                  variant="secondary"
                  className="mt-4 w-full sm:w-auto"
                >
                  Add medication
                </ButtonLink>
              ) : null
            }
          />
          <SummaryCard
            title={todayLog ? "Today" : "Last entry"}
            value={checkInValue}
            detail={todayLog ? continuityLine : statusLine}
          />
        </div>
      </section>

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
            data={doseChartData}
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
          ) : null}
        </Card>

        {doctorVisitSummary ? (
          <DoctorVisitSummaryPanel summary={doctorVisitSummary} />
        ) : (
          <Card className="rounded-[2rem] p-6 sm:p-7">
            <h3 className="text-[1.45rem] font-semibold tracking-tight text-slate-900">
              Add your medication when you want to.
            </h3>
            <p className="mt-3 text-base leading-7 text-slate-700">
              That makes the dose view and appointment summary more useful, but you do not need it to keep logging.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/onboarding?step=medication">Add medication</ButtonLink>
              <ExportLogsButton disabled={!logs.length} />
            </div>
          </Card>
        )}
      </section>
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

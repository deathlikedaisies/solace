import { MetricChart } from "@/components/charts/metric-chart";
import { DoctorVisitSummaryPanel } from "@/components/doctor-visit/doctor-visit-summary-panel";
import { EmptyState } from "@/components/feedback/empty-state";
import { ExportLogsButton } from "@/components/export/export-logs-button";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";
import { buildDoctorVisitSummary } from "@/lib/doctor-visit-summary";
import {
  cn,
  describeRelativeDate,
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
  const latestSymptoms = latestLog?.symptoms.length ?? 0;
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
  const todayCue = todayLog
    ? "You've checked in today."
    : latestLog
      ? `Last entry: ${describeRelativeDate(latestLog.log_date)}.`
      : "No check-in yet.";
  const checkInValue = todayLog
    ? "Today"
    : latestLog
      ? formatRelativeDateLabel(latestLog.log_date)
      : "Open";
  const changeCue = doseChange > 0 ? `Down from ${formatDose(startingDose)}` : "No change today";
  const sleepCue = getSleepCue(averages.sleepHours);
  const symptomValue = todayLog
    ? `${todayLog.symptoms.length} today`
    : latestLog
      ? `${latestSymptoms} last time`
      : "No entries";
  const streakLine =
    streak > 0
      ? `${streak} day${streak === 1 ? "" : "s"} in a row`
      : latestLog
        ? "Pick up again when you are ready."
        : "The next check-in starts your run of days.";
  return (
    <div className="space-y-8">
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
              Check-in overview
            </p>
            <h2 className="text-[1.9rem] font-semibold tracking-tight text-slate-900 sm:text-[2.1rem]">
              {todayLog ? "Today is already noted." : "A quick look at where things stand."}
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              {todayLog
                ? "You've checked in today."
                : latestLog
                  ? `Last entry: ${describeRelativeDate(latestLog.log_date)}.`
                  : "Start with today, or add a recent day you missed."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/log">
              {todayLog ? "Update today's note" : "Log today"}
            </ButtonLink>
            <ButtonLink href="/journal" variant="secondary">
              Journal
            </ButtonLink>
            <ExportLogsButton disabled={!logs.length} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard label="Check-in" value={checkInValue} cue={todayCue} />
        <OverviewCard
          label="Current dose"
          value={formatDose(profile.current_dose)}
          cue={changeCue}
        />
        <OverviewCard
          label="Symptoms recently"
          value={symptomValue}
          cue={symptomCue}
          tone={symptomCue === "A bit heavier lately" ? "soft-alert" : "default"}
        />
        <OverviewCard
          label="Recent sleep"
          value={formatHours(averages.sleepHours)}
          cue={sleepCue}
        />
      </div>

      <DoctorVisitSummaryPanel summary={doctorVisitSummary} />

      {insights.length ? (
        <Card className="rounded-[2rem] p-6 sm:p-7">
          <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
            A few recent notes
          </p>
          <div className="mt-4 space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 text-sm leading-6 text-slate-700"
              >
                {insight.text}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

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
            <div className="flex items-end justify-between gap-4 px-1">
              <div>
                <h3 className="text-[1.35rem] font-semibold tracking-tight text-slate-900">
                  Recent patterns
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Just enough to help you notice what has been steady and what has shifted.
                </p>
              </div>
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

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-[2rem] p-6 sm:p-7">
              <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
                Last note
              </p>
              <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight text-slate-900">
                Most recent day
              </h3>
              {latestLog ? (
                <div className="mt-6 space-y-3 text-sm text-slate-700">
                  <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                    {formatDate(latestLog.log_date)}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailPill>Dose {formatDose(latestLog.dose)}</DetailPill>
                    <DetailPill>Anxiety {latestLog.anxiety}/10</DetailPill>
                    <DetailPill>Mood {latestLog.mood}/10</DetailPill>
                    <DetailPill>Sleep {formatHours(latestLog.sleep_hours)}</DetailPill>
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
              <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
                Dose path
              </p>
              <h3 className="mt-2 text-[1.5rem] font-semibold tracking-tight text-slate-900">
                Taper snapshot
              </h3>
              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 text-slate-700">
                  {streakLine}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  {profile.benzo_name}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  Started from {formatDose(startingDose)}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  Now at {formatDose(profile.current_dose)}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  Taper start {formatCompactDate(profile.taper_start_date)}
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function OverviewCard({
  label,
  value,
  cue,
  tone = "default",
}: {
  label: string;
  value: string;
  cue: string;
  tone?: "default" | "soft-alert";
}) {
  return (
    <Card className="rounded-[1.75rem] p-5 sm:p-6">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p
        className={cn(
          "mt-2 text-sm",
          tone === "soft-alert" ? "text-danger-500" : "text-slate-500",
        )}
      >
        {cue}
      </p>
    </Card>
  );
}

function DetailPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[1.25rem] bg-warm-100/90 px-4 py-3 text-sm text-slate-700">
      {children}
    </div>
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

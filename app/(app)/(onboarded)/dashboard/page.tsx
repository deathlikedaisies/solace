import { MetricChart } from "@/components/charts/metric-chart";
import { EmptyState } from "@/components/feedback/empty-state";
import { ExportLogsButton } from "@/components/export/export-logs-button";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getDashboardData } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { cn, formatCompactDate, formatDate, formatDose, formatHours } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const { profile, logs, latestLog, todayLog, averages, streak, events } =
    await getDashboardData(user.id);

  if (!profile) {
    return null;
  }

  const chartData = logs.slice(-21);
  const chartStart = chartData[0]?.log_date;
  const reductionMarkers = events
    .filter((event) => event.event_type === "reduction")
    .filter((event) => !chartStart || event.event_date >= chartStart)
    .map((event) => ({ date: event.event_date, label: "Reduction" }));
  const startingDose = profile.starting_dose ?? profile.current_dose;
  const doseChange = Number((startingDose - profile.current_dose).toFixed(2));
  const latestSymptoms = latestLog?.symptoms.length ?? 0;
  const previousWeek = logs.slice(-14, -7);
  const previousSymptomAverage = average(previousWeek.map((log) => log.symptoms.length));
  const symptomCue = getTrendCue(averages.symptomLoad, previousSymptomAverage, {
    lower: "Lighter than last week",
    same: "About the same",
    higher: "A bit heavier lately",
  });
  const doseCue = todayLog
    ? "Saved today"
    : latestLog
      ? `Last entry ${formatCompactDate(latestLog.log_date)}`
      : "No entry yet";
  const changeCue =
    doseChange > 0
      ? `Down from ${formatDose(startingDose)}`
      : "No change yet";
  const sleepCue = getSleepCue(averages.sleepHours);

  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
              Check-in overview
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              {todayLog ? "Today is already here." : "A quick look at where things stand."}
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              {todayLog
                ? "You have already saved today&apos;s entry. Take a look around or move on with your day."
                : "Start with today&apos;s entry, or look over the last few weeks."}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/log">
              {todayLog ? "Update today&apos;s entry" : "Log today"}
            </ButtonLink>
            <ButtonLink href="/journal" variant="secondary">
              Journal
            </ButtonLink>
            <ExportLogsButton disabled={!logs.length} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard label="Today" value={todayLog ? "Saved" : "Open"} cue={doseCue} />
        <OverviewCard
          label="Current dose"
          value={formatDose(profile.current_dose)}
          cue={changeCue}
        />
        <OverviewCard
          label="Symptoms lately"
          value={`${latestSymptoms} today`}
          cue={symptomCue}
          tone={symptomCue === "A bit heavier lately" ? "soft-alert" : "default"}
        />
        <OverviewCard
          label="Sleep lately"
          value={formatHours(averages.sleepHours)}
          cue={sleepCue}
        />
      </div>

      {!logs.length ? (
        <EmptyState
          title="Your overview will take shape as you go"
          description="Once you save a daily entry, your recent dose, symptoms, mood, and sleep will start to line up here."
          actionHref="/log"
          actionLabel="Save your first entry"
          secondaryAction={<ExportLogsButton disabled />}
        />
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4 px-1">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                  Recent patterns
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Look for what tends to happen after a reduction.
                </p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              <MetricChart
                title="Dose"
                subtitle="Recent entries"
                data={chartData.map((log) => ({ date: log.log_date, value: log.dose }))}
                suffix=" mg"
                markers={reductionMarkers}
              />
              <MetricChart
                title="Symptoms"
                subtitle="How many you marked each day"
                data={chartData.map((log) => ({
                  date: log.log_date,
                  value: log.symptoms.length,
                }))}
                colorClass="stroke-danger-500"
                markers={reductionMarkers}
              />
              <MetricChart
                title="Anxiety"
                subtitle="0 to 10"
                data={chartData.map((log) => ({ date: log.log_date, value: log.anxiety }))}
              />
              <MetricChart
                title="Mood"
                subtitle="0 to 10"
                data={chartData.map((log) => ({ date: log.log_date, value: log.mood }))}
                colorClass="stroke-lavender-300"
              />
              <MetricChart
                title="Sleep"
                subtitle="Hours slept"
                data={chartData.map((log) => ({ date: log.log_date, value: log.sleep_hours }))}
                colorClass="stroke-secondary-400"
                suffix=" h"
              />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="rounded-[2rem] p-6">
              <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
                Last entry
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Most recent note
              </h3>
              {latestLog ? (
                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                    {formatDate(latestLog.log_date)}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailPill> Dose {formatDose(latestLog.dose)} </DetailPill>
                    <DetailPill> Anxiety {latestLog.anxiety}/10 </DetailPill>
                    <DetailPill> Mood {latestLog.mood}/10 </DetailPill>
                    <DetailPill> Sleep {formatHours(latestLog.sleep_hours)} </DetailPill>
                  </div>
                  <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 leading-6 text-slate-700">
                    7-day average: anxiety {averages.anxiety}/10, mood {averages.mood}/10, sleep {formatHours(averages.sleepHours)}, symptoms {averages.symptomLoad}/day.
                  </div>
                </div>
              ) : (
                <p className="mt-4 rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-6 text-slate-500">
                  Your latest entry will appear here.
                </p>
              )}
            </Card>

            <Card className="rounded-[2rem] p-6">
              <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
                Dose path
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Taper snapshot
              </h3>
              <div className="mt-5 space-y-3 text-sm text-slate-700">
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
                <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3">
                  {streak > 0 ? `You have checked in ${streak} day${streak === 1 ? "" : "s"} in a row.` : "Your streak begins with the next entry."}
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
    <Card className="rounded-[1.75rem] p-5">
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

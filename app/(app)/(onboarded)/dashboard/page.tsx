import { MetricChart } from "@/components/charts/metric-chart";
import { EmptyState } from "@/components/feedback/empty-state";
import { ExportLogsButton } from "@/components/export/export-logs-button";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getDashboardData } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { formatCompactDate, formatDate, formatDose, formatHours } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard label="Benzo" value={profile.benzo_name} />
        <OverviewCard label="Starting dose" value={formatDose(startingDose)} />
        <OverviewCard label="Current dose" value={formatDose(profile.current_dose)} />
        <OverviewCard
          label="Dose change"
          value={doseChange > 0 ? `-${formatDose(doseChange)}` : "No change yet"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="rounded-[2rem] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Daily check-in and patterns
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Your recent entries are shown in simple trend views so dose changes,
            symptom flare-ups, mood, and sleep stay visible without making the
            screen feel noisy or clinical.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/log">
              {todayLog ? "Update today's log" : "Log today"}
            </ButtonLink>
            <ButtonLink href="/journal" variant="secondary">
              Open journal
            </ButtonLink>
            <ExportLogsButton disabled={!logs.length} />
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-warm-100/90 px-4 py-4 text-sm leading-6 text-slate-700">
            Reduction markers appear on the dose and symptom charts so you can
            spot whether symptoms usually flare a few days after a cut.
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] p-6">
            <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
              Latest saved log
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Most recent check-in
            </h2>
            {latestLog ? (
              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  {formatDate(latestLog.log_date)}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  Dose {formatDose(latestLog.dose)}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  Anxiety {latestLog.anxiety}/10, Mood {latestLog.mood}/10
                </div>
                <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
                  Symptoms selected: {latestLog.symptoms.length}
                </div>
                <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 leading-6 text-slate-700">
                  Sleep {formatHours(latestLog.sleep_hours)}. 7-day averages: anxiety {averages.anxiety}/10, mood {averages.mood}/10, sleep {formatHours(averages.sleepHours)}, symptoms {averages.symptomLoad}/day.
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-6 text-slate-500">
                No daily logs saved yet. Start with your first check-in.
              </p>
            )}
          </Card>

          <Card className="rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Profile snapshot
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
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
                Check-in streak {streak} day{streak === 1 ? "" : "s"}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {!logs.length ? (
        <EmptyState
          title="Your dashboard will fill in as you log"
          description="Once you save a daily check-in, your recent dose, symptom load, anxiety, mood, and sleep patterns will appear here in simple charts."
          actionHref="/log"
          actionLabel="Save your first check-in"
          secondaryAction={<ExportLogsButton disabled />}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <MetricChart
          title="Dose over time"
          subtitle="Saved dose for recent entries"
          data={chartData.map((log) => ({ date: log.log_date, value: log.dose }))}
          suffix=" mg"
          markers={reductionMarkers}
        />
        <MetricChart
          title="Symptom load"
          subtitle="How many symptoms you selected each day"
          data={chartData.map((log) => ({
            date: log.log_date,
            value: log.symptoms.length,
          }))}
          colorClass="stroke-danger-500"
          markers={reductionMarkers}
        />
        <MetricChart
          title="Anxiety over time"
          subtitle="Self-rated on a 0 to 10 scale"
          data={chartData.map((log) => ({ date: log.log_date, value: log.anxiety }))}
        />
        <MetricChart
          title="Mood over time"
          subtitle="Self-rated on a 0 to 10 scale"
          data={chartData.map((log) => ({ date: log.log_date, value: log.mood }))}
          colorClass="stroke-lavender-300"
        />
        <MetricChart
          title="Sleep over time"
          subtitle="Sleep hours for recent entries"
          data={chartData.map((log) => ({ date: log.log_date, value: log.sleep_hours }))}
          colorClass="stroke-secondary-400"
          suffix=" h"
        />
      </div>
    </div>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-[1.75rem] p-5">
      <p className="text-sm text-slate-600">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </Card>
  );
}

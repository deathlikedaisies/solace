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
  const { profile, logs, latestLog, todayLog, averages, streak } = await getDashboardData(user.id);

  if (!profile) {
    return null;
  }

  const chartData = logs.slice(-14);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard label="Benzo" value={profile.benzo_name} />
        <OverviewCard label="Current dose" value={formatDose(profile.current_dose)} />
        <OverviewCard label="Check-in streak" value={`${streak} days`} />
        <OverviewCard label="Today" value={todayLog ? "Saved" : "Not logged yet"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="rounded-[2rem] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Daily check-in and patterns
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            Your recent entries are shown in simple trend views so changes stay
            visible without making the screen feel noisy or clinical.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/log">
              {todayLog ? "Update today&apos;s log" : "Log today"}
            </ButtonLink>
            <ButtonLink href="/journal" variant="secondary">
              Open journal
            </ButtonLink>
            <ExportLogsButton disabled={!logs.length} />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] p-6">
            <p className="text-xs font-medium tracking-[0.22em] text-slate-400 uppercase">
              Latest saved log
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Most recent check-in
            </h2>
            {latestLog ? (
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
                  {formatDate(latestLog.log_date)}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
                  Dose {formatDose(latestLog.dose)}
                </div>
                <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
                  Anxiety {latestLog.anxiety}/10, Mood {latestLog.mood}/10
                </div>
                <div className="rounded-[1.5rem] bg-primary-50 px-4 py-3 leading-6">
                  Sleep {formatHours(latestLog.sleep_hours)}. 7-day averages: anxiety {averages.anxiety}/10, mood {averages.mood}/10, sleep {formatHours(averages.sleepHours)}.
                </div>
              </div>
            ) : (
              <p className="mt-4 rounded-[1.5rem] bg-warm-100 px-4 py-3 text-sm leading-6 text-slate-500">
                No daily logs saved yet. Start with your first check-in.
              </p>
            )}
          </Card>

          <Card className="rounded-[2rem] p-6">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Profile snapshot
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
                {profile.benzo_name}
              </div>
              <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
                {formatDose(profile.current_dose)}
              </div>
              <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
                Started {formatCompactDate(profile.taper_start_date)}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {!logs.length ? (
        <EmptyState
          title="Your dashboard will fill in as you log"
          description="Once you save a daily check-in, your recent dose, anxiety, mood, and sleep patterns will appear here in simple charts."
          actionHref="/log"
          actionLabel="Save your first check-in"
          secondaryAction={<ExportLogsButton disabled />}
        />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <MetricChart
          title="Dose over time"
          subtitle="Saved dose for recent entries"
          data={chartData.map((log) => ({ date: log.log_date, value: log.dose }))}
          suffix=" mg"
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
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </Card>
  );
}

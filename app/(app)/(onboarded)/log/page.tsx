import { DailyCheckInForm } from "@/components/forms/daily-checkin-form";
import { Card } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDose, formatHours, todayIso } from "@/lib/utils";

export default async function LogPage() {
  const user = await requireUser("/log");
  const { profile, logs, todayLog } = await getDashboardData(user.id);

  if (!profile) {
    return null;
  }

  const recentLogs = logs.slice(-3).reverse();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <DailyCheckInForm
        profileDose={profile.current_dose}
        initialLog={todayLog}
        today={todayIso()}
      />

      <div className="space-y-6">
        <Card className="rounded-[2rem] p-6">
          <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
            Today
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
            Keep it brief if that helps.
          </h2>
          <div className="mt-5 space-y-3 text-sm text-slate-700">
            <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
              Saving the same date updates that entry.
            </div>
            <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
              Current dose on file: {formatDose(profile.current_dose)}
            </div>
            <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3 leading-6">
              A few words are enough. You can always come back later.
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] p-6">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Recent entries
          </h2>
          <div className="mt-4 space-y-3">
            {recentLogs.length ? (
              recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm text-slate-700"
                >
                  <p className="font-medium text-slate-900">
                    {formatDate(log.log_date)}
                  </p>
                  <p className="mt-1">
                    {formatDose(log.dose)} - Anxiety {log.anxiety}/10 - Mood {log.mood}/10
                  </p>
                  <p className="mt-1 text-slate-600">Sleep {formatHours(log.sleep_hours)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm text-slate-500">
                Your last few entries will settle here.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
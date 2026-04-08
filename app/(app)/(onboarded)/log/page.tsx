import Link from "next/link";
import { DailyCheckInForm } from "@/components/forms/daily-checkin-form";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getDashboardData, hasMedicationDetails } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { formatDate, formatDose, formatHours, shiftIsoDate, todayIso } from "@/lib/utils";

type LogPageProps = {
  searchParams: Promise<{
    date?: string | string[];
  }>;
};

export default async function LogPage({ searchParams }: LogPageProps) {
  const user = await requireUser("/log");
  const { profile, logs } = await getDashboardData(user.id);
  const hasMedication = hasMedicationDetails(profile);

  const today = todayIso();
  const yesterday = shiftIsoDate(today, -1);
  const resolvedSearchParams = await searchParams;
  const requestedDate = Array.isArray(resolvedSearchParams.date)
    ? resolvedSearchParams.date[0]
    : resolvedSearchParams.date;
  const initialDate =
    requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
      ? requestedDate
      : today;
  const initialLog = logs.find((log) => log.log_date === initialDate) ?? null;
  const recentLogs = logs.slice(-3).reverse();
  const isFirstLog = logs.length === 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
      <DailyCheckInForm
        profileDose={profile?.current_dose ?? null}
        profileMedication={profile?.benzo_name ?? null}
        initialDate={initialDate}
        initialLog={initialLog}
        logs={logs}
        today={today}
        isFirstLog={isFirstLog}
        hasMedicationDetails={hasMedication}
      />

      <div className="space-y-6">
        <Card className="rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            {isFirstLog ? "Start with today." : "Keep it brief if that helps."}
          </h2>
          <div className="mt-5 space-y-3 text-base leading-7 text-slate-700">
            <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
              You can keep this brief. You can always come back later.
            </div>
            {profile?.current_dose ? (
              <div className="rounded-[1.5rem] bg-white/80 px-4 py-3">
                Current dose on file: {formatDose(profile.current_dose)}
              </div>
            ) : null}
            {!hasMedication ? (
              <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3">
                You can add your medication and dose after this, if you want it here.
              </div>
            ) : null}
            {!isFirstLog ? (
              <>
                <div className="rounded-[1.5rem] bg-primary-50/90 px-4 py-3">
                  If yesterday slipped by, you can add it without starting over.
                </div>
                <ButtonLink href={`/log?date=${yesterday}`} variant="secondary" className="w-full sm:w-auto">
                  Start with yesterday
                </ButtonLink>
              </>
            ) : null}
          </div>
        </Card>

        {!isFirstLog ? (
          <Card className="rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Recent days
            </h2>
            <div className="mt-4 space-y-3">
              {recentLogs.length ? (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-6 text-slate-700"
                  >
                    <p className="font-medium text-slate-900">{formatDate(log.log_date)}</p>
                    <p className="mt-2"><span className="font-medium text-slate-900">Dose</span> {formatDose(log.dose)}</p>
                    <p><span className="font-medium text-slate-900">Anxiety</span> {log.anxiety} / 10</p>
                    <p><span className="font-medium text-slate-900">Mood</span> {log.mood} / 10</p>
                    <p><span className="font-medium text-slate-900">Sleep</span> {formatHours(log.sleep_hours)}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-6 text-slate-500">
                  Your recent days will settle here.
                </p>
              )}
            </div>
          </Card>
        ) : (
          <Card className="rounded-[2rem] p-6">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Looking back comes later.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-700">
              Once you save today, your timeline and journal will start to take shape.
            </p>
            <div className="mt-5">
              <Link
                href="/onboarding?step=medication"
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 hover:bg-warm-100"
              >
                Set up medication first
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

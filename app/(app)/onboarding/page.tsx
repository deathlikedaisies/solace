import Link from "next/link";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import {
  getProfileAndLogs,
  hasMedicationDetails,
  hasStartedTracking,
} from "@/lib/data";
import { requireUser } from "@/lib/auth";

type OnboardingPageProps = {
  searchParams: Promise<{
    step?: string | string[];
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const user = await requireUser("/onboarding");
  const { profile, logs } = await getProfileAndLogs(user.id);
  const resolvedSearchParams = await searchParams;
  const requestedStep = Array.isArray(resolvedSearchParams.step)
    ? resolvedSearchParams.step[0]
    : resolvedSearchParams.step;
  const showMedicationStep = requestedStep === "medication";
  const startedTracking = hasStartedTracking(logs);
  const hasMedication = hasMedicationDetails(profile);

  if (startedTracking && hasMedication) {
    redirect("/dashboard");
  }

  if (!startedTracking && hasMedication) {
    redirect("/log");
  }

  if (showMedicationStep || startedTracking) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <Card className="rounded-[2rem] p-6 sm:p-8">
          <h1 className="text-[2rem] font-semibold tracking-tight text-slate-900 sm:text-[2.2rem]">
            {startedTracking
              ? "If you want, you can add your medication and dose now."
              : "If it helps, you can add your medication first."}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-700">
            {startedTracking
              ? "This helps keep your notes, dose changes, and timeline in one place."
              : "You can still go straight to today if that feels easier."}
          </p>
        </Card>
        <OnboardingForm profile={profile} nextPath={startedTracking ? "/dashboard" : "/log"} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
              Start here
            </p>
            <h1 className="mt-3 max-w-[20ch] text-[2rem] font-semibold tracking-tight text-slate-900 sm:text-[2.75rem] sm:leading-[1.15]">
              A quiet place to keep track of how things have been.
            </h1>
            <p className="mt-4 max-w-[40ch] text-base leading-7 text-slate-700">
              You can start with today. You can always add more later.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href="/log">Start with today</ButtonLink>
            <Link
              href="/onboarding?step=medication"
              className="focus-ring inline-flex min-h-12 items-center rounded-full px-4 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Set up medication first
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

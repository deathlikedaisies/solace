import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { Card } from "@/components/ui/card";
import { getProfile, isProfileComplete } from "@/lib/data";
import { requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  const profile = await getProfile(user.id);

  if (isProfileComplete(profile)) {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
          Start with the essentials.
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-700">
          A few basics are enough to get your notes, charts, and timeline started.
        </p>
        <div className="mt-6 space-y-3 text-base leading-7 text-slate-700">
          <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
            Your medication
          </div>
          <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
            The dose you are on now
          </div>
          <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
            When your taper began, and the dose you began from
          </div>
          <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
            Any notes you want to keep for context
          </div>
        </div>
      </Card>
      <OnboardingForm profile={profile} />
    </div>
  );
}
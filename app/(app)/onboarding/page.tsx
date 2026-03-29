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
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
          Onboarding
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Start with the fuller picture.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Solace works best when it knows both the dose you started tapering from
          and the dose you are on now. That makes the timeline and charts easier
          to read later.
        </p>
        <div className="mt-6 space-y-3 text-sm text-slate-700">
          <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
            Benzo name, taper starting dose, and current dose
          </div>
          <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
            Taper start date for your first timeline marker
          </div>
          <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3">
            Optional notes for context if you are already partway through
          </div>
        </div>
      </Card>
      <OnboardingForm profile={profile} />
    </div>
  );
}

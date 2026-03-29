import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { Card } from "@/components/ui/card";
import { getProfile } from "@/lib/data";
import { requireUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  const profile = await getProfile(user.id);

  if (profile) {
    redirect("/dashboard");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-medium tracking-[0.22em] text-slate-400 uppercase">
          Onboarding
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Start with the basics.
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Add your current taper details once so Solace can treat the rest of
          the app as your private working space.
        </p>
        <div className="mt-6 space-y-3 text-sm text-slate-600">
          <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
            Benzo name and current dose
          </div>
          <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
            Taper start date
          </div>
          <div className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
            Optional notes for context
          </div>
        </div>
      </Card>
      <OnboardingForm profile={profile} />
    </div>
  );
}

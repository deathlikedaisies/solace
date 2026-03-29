import Link from "next/link";
import { redirect } from "next/navigation";
import { homeHighlights } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth";

const homeDetails = [
  "Starting and current dose kept side by side",
  "Daily symptom, mood, and sleep notes in one short entry",
  "A timeline that helps you notice changes and steadier stretches",
] as const;

export default async function HomePage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-6 sm:px-8 lg:justify-center">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="space-y-6 rounded-[2rem] border border-white/70 bg-[rgba(251,248,243,0.82)] p-7 shadow-[0_24px_80px_rgba(54,66,82,0.08)] backdrop-blur sm:p-10">
          <div className="inline-flex w-fit items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-medium tracking-[0.24em] text-sky-700 uppercase">
            Private taper journal
          </div>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              A steady place to keep track of how things have been.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-800 sm:text-lg">
              Solace gives you one private place to keep the details, especially on days when you do not want to think too hard about where to put them.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/signup">Create an account</ButtonLink>
            <ButtonLink href="/login" variant="secondary">
              Log in
            </ButtonLink>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {homeDetails.map((detail) => (
              <div
                key={detail}
                className="rounded-[1.5rem] bg-white/78 px-4 py-4 text-sm leading-6 font-medium text-slate-800"
              >
                {detail}
              </div>
            ))}
          </div>
          <p className="text-sm leading-6 text-slate-700">
            Private by default. No medical advice.
          </p>
        </div>

        <Card className="space-y-5 rounded-[2rem] bg-slate-900/92 p-7 text-slate-50 shadow-[0_24px_80px_rgba(38,46,58,0.20)] sm:p-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-200 uppercase">
              What you can keep here
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              One place for the details that matter.
            </h2>
          </div>
          <div className="space-y-3">
            {homeHighlights.map((feature) => (
              <div
                key={feature}
                className="flex items-start gap-3 rounded-2xl border border-white/12 bg-white/7 p-4"
              >
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-secondary-300" />
                <p className="text-sm leading-6 font-medium text-slate-100">{feature}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-lavender-300/45 bg-lavender-200/18 p-4 text-sm leading-6 font-medium text-slate-50">
            Daily entries, journal, timeline, and export are already ready when you are.
          </div>
          <Link
            href="/signup"
            className="inline-flex text-sm font-semibold text-primary-100 transition hover:text-white"
          >
            Start with email and password
          </Link>
        </Card>
      </section>
    </main>
  );
}
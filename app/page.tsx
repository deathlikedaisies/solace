import { redirect } from "next/navigation";
import { homeHighlights } from "@/lib/constants";
import { Logo } from "@/components/branding/logo";
import { ButtonLink } from "@/components/ui/button";
import { getOptionalUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getOptionalUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex w-full max-w-[720px] flex-1 flex-col px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-20">
      <section className="w-full pb-12 text-left">
        <div className="mb-3 space-y-3">
          <Logo className="text-sm tracking-[0.14em] text-slate-600" />
          <p className="text-xs font-medium tracking-[0.2em] text-slate-500 uppercase opacity-60">
            Private notes for your taper
          </p>
        </div>

        <h1 className="mb-5 max-w-[20ch] text-[2rem] leading-[1.2] font-semibold tracking-tight text-slate-900 sm:text-[3rem]">
          A quiet place to keep track of how things have been.
        </h1>

        <p className="mb-8 max-w-[40ch] text-base leading-[1.6] text-slate-700 opacity-80 sm:text-lg">
          When days feel foggy or difficult, Solace keeps your dose, symptoms, sleep, and notes in one place.
        </p>

        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/signup">Create an account</ButtonLink>
          <ButtonLink href="/login" variant="secondary">
            Log in
          </ButtonLink>
        </div>

        <p className="mt-6 text-[13px] leading-6 text-slate-600 opacity-60">
          Private by default. No medical advice.
        </p>
      </section>

      <section className="mt-16 w-full max-w-[720px]">
        <h2 className="mb-4 text-lg font-medium text-slate-800">
          What you can keep here
        </h2>
        <ul className="space-y-3 text-[15px] leading-[1.6] text-slate-700 opacity-85 sm:text-base">
          {homeHighlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-300" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
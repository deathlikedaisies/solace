import { Card } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

type RoutePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function RoutePlaceholder({
  eyebrow,
  title,
  description,
  bullets,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: RoutePlaceholderProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <p className="text-xs font-medium tracking-[0.22em] text-slate-400 uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
      </Card>

      <Card className="rounded-[2rem] p-6 sm:p-8">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">
          Reserved for the next phase
        </h3>
        <div className="mt-5 space-y-3 text-sm text-slate-600">
          {bullets.map((bullet) => (
            <div key={bullet} className="rounded-[1.5rem] bg-warm-100 px-4 py-3">
              {bullet}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href={primaryHref}>{primaryLabel}</ButtonLink>
          {secondaryHref && secondaryLabel ? (
            <ButtonLink href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </ButtonLink>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

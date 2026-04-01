import { getApproximateDiazepamEquivalent } from "@/lib/benzodiazepines";
import { cn } from "@/lib/utils";

type ApproximateDiazepamHelperProps = {
  medication: string | null | undefined;
  dose: number | null | undefined;
  className?: string;
  compact?: boolean;
};

export function ApproximateDiazepamHelper({
  medication,
  dose,
  className,
  compact = false,
}: ApproximateDiazepamHelperProps) {
  const estimate = getApproximateDiazepamEquivalent(medication, dose);

  if (!estimate) {
    return null;
  }

  return (
    <div className={cn("rounded-[1.4rem] bg-primary-50/80 px-4 py-3", className)}>
      <p className="text-[11px] font-medium tracking-[0.18em] text-slate-500 uppercase">
        Approximate diazepam equivalent
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{estimate.summary}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{estimate.caution}</p>
      {!compact ? (
        <details className="mt-2 text-xs leading-5 text-slate-500">
          <summary className="cursor-pointer list-none font-medium text-slate-500 marker:hidden">
            Why this is approximate
          </summary>
          <p className="mt-2">{estimate.cautionDetail}</p>
        </details>
      ) : null}
    </div>
  );
}
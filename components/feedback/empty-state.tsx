import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  secondaryAction?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("rounded-[2rem] p-6 sm:p-8", className)}>
      <div className="mx-auto max-w-xl text-center sm:text-left">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-700">{description}</p>
        {actionHref && actionLabel ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={actionHref}
              className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-primary-400 px-5 text-sm font-medium text-slate-950 shadow-sm hover:bg-primary-500"
            >
              {actionLabel}
            </Link>
            {secondaryAction}
          </div>
        ) : secondaryAction ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {secondaryAction}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
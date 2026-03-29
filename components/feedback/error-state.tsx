"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went off track.",
  description = "Please try again in a moment. If it keeps happening, log out and back in before trying again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="rounded-[2rem] p-6 sm:p-8">
      <p className="text-xs font-medium tracking-[0.22em] text-slate-400 uppercase">
        Error state
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
      {onRetry ? (
        <div className="mt-6">
          <Button type="button" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export function RouteErrorState({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState onRetry={unstable_retry} />;
}

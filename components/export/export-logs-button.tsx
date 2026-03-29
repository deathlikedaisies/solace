"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExportLogsButtonProps = {
  disabled?: boolean;
  className?: string;
};

export function ExportLogsButton({
  disabled = false,
  className,
}: ExportLogsButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    if (disabled || pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/export/logs", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Unable to export right now.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="?([^\"]+)"?/i);
      const filename = match?.[1] ?? "solace-daily-logs.csv";
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to export right now.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant="secondary"
        onClick={handleExport}
        disabled={disabled || pending}
        className="w-full sm:w-auto"
      >
        {pending ? "Preparing CSV..." : "Export CSV"}
      </Button>
      {error ? <p className="text-sm text-danger-500">{error}</p> : null}
      {disabled ? (
        <p className="text-sm text-slate-500">Save at least one daily log to export your data.</p>
      ) : null}
    </div>
  );
}

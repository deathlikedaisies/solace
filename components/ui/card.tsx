import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "surface soft-shadow rounded-[1.75rem] border border-white/70 bg-white/80",
        className,
      )}
      {...props}
    />
  );
}

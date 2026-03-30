import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const cardToneClasses = {
  default: "surface border border-white/70 bg-[rgba(252,249,244,0.86)]",
  dark: "border border-slate-900/70 bg-slate-900/94 text-slate-50 backdrop-blur",
} as const;

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof cardToneClasses;
};

export function Card({
  className,
  tone = "default",
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "soft-shadow rounded-[1.75rem]",
        cardToneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
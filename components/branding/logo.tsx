import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
};

export function Logo({ href = "/", className }: LogoProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center text-[0.95rem] font-medium tracking-[0.16em] text-slate-700",
        className,
      )}
    >
      Solace
    </span>
  );

  return href ? (
    <Link href={href} className="focus-ring inline-flex rounded-full">
      {content}
    </Link>
  ) : (
    content
  );
}
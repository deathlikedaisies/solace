import Link from "next/link";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "bg-primary-400 text-slate-950 hover:bg-primary-500 focus-visible:ring-primary-300",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:bg-warm-100 focus-visible:ring-primary-300",
  subtle:
    "bg-white/10 text-white border border-white/15 hover:bg-white/15 focus-visible:ring-white/40",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-55",
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = PropsWithChildren<{
  href: string;
  className?: string;
  variant?: keyof typeof buttonVariants;
}>;

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-medium shadow-sm",
        buttonVariants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
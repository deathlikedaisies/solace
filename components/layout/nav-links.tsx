"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      <nav className="hidden items-center gap-2 md:flex">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring rounded-full px-4 py-2 text-sm font-medium text-slate-600",
                active && "bg-primary-100 text-slate-900",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <nav className="grid grid-cols-2 gap-2 md:hidden">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/70 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700",
                active && "border-primary-200 bg-primary-100 text-slate-900",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
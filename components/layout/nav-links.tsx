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
                "focus-ring rounded-full px-4 py-2 text-sm font-medium text-slate-500",
                active && "bg-primary-100 text-slate-900",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <nav className="fixed inset-x-0 bottom-20 z-40 mx-auto flex w-[calc(100%-1.5rem)] max-w-md items-center gap-1 rounded-full border border-white/80 bg-white/90 px-2 py-2 shadow-[0_14px_40px_rgba(55,68,86,0.14)] backdrop-blur md:hidden">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring flex min-h-11 flex-1 items-center justify-center rounded-full px-2 py-2 text-sm font-medium text-slate-500",
                active && "bg-primary-100 text-slate-900",
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

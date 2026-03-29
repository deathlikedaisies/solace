import type { ReactNode } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { NavLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

type AppShellProps = {
  children: ReactNode;
  user: User;
  title?: string;
  subtitle?: string;
};

export function AppShell({
  children,
  user,
  title = "A private place to track gently.",
  subtitle = "Your private record of dose, symptoms, and patterns.",
}: AppShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <Card className="rounded-[1.75rem] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-[0.24em] text-slate-500 uppercase">
              Solace
            </p>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                {title}
              </h1>
              <p className="text-sm text-slate-600">{subtitle}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div className="min-w-0 sm:block sm:text-right">
              <p className="truncate text-sm font-medium text-slate-700">
                {user.email ?? "Signed in"}
              </p>
              <p className="text-xs text-slate-500">Private account</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <form action={signOutAction}>
                <Button variant="secondary" type="submit" className="w-full sm:w-auto">
                  Log out
                </Button>
              </form>
              <Link
                href="/"
                className="focus-ring inline-flex min-h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-warm-100"
              >
                Home
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <NavLinks />
        </div>
      </Card>
      <div className="flex flex-1 flex-col gap-6 pb-8">{children}</div>
    </div>
  );
}

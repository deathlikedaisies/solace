import type { ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { Logo } from "@/components/branding/logo";
import { Card } from "@/components/ui/card";
import { NavLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions/auth";

type AppShellProps = {
  children: ReactNode;
  user: User;
};

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
      <Card className="rounded-[1.75rem] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo className="text-sm tracking-[0.14em] text-slate-600" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <p className="min-w-0 truncate text-sm font-medium text-slate-700 sm:max-w-64 sm:text-right">
              {user.email ?? "Signed in"}
            </p>
            <form action={signOutAction}>
              <Button variant="secondary" type="submit" className="w-full sm:w-auto">
                Log out
              </Button>
            </form>
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
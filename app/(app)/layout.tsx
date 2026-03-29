import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();

  return (
    <AppShell
      user={user}
      title="A private space for daily taper notes."
      subtitle="Dose changes, symptoms, and the days in between."
    >
      {children}
    </AppShell>
  );
}

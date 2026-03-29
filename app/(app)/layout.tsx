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
      title="A calm space for daily taper tracking."
      subtitle="Authenticated space for the core product routes"
    >
      {children}
    </AppShell>
  );
}

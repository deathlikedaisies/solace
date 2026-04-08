import { requireUser } from "@/lib/auth";

export default async function OnboardedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();

  return <>{children}</>;
}

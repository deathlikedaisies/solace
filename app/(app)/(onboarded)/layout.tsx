import { redirect } from "next/navigation";
import { getProfile, isProfileComplete } from "@/lib/data";
import { requireUser } from "@/lib/auth";

export default async function OnboardedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireUser();
  const profile = await getProfile(user.id);

  if (!isProfileComplete(profile)) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}

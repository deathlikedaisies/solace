import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/lib/actions/auth";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-[0.22em] text-slate-500 uppercase">
            Welcome back
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
            Pick up where you left off.
          </h2>
          <p className="max-w-lg text-base leading-7 text-slate-700">
            Your notes are here when you need them.
          </p>
          <p className="text-sm text-slate-600">
            New here?{" "}
            <Link className="font-medium text-primary-700" href="/signup">
              Create an account
            </Link>
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <AuthForm
            title="Log in"
            description="Use your email and password to open your private space."
            reassuranceText="You'll return to your journal after logging in."
            submitLabel="Log in"
            action={signInAction}
            next={params.next}
            forgotPasswordHref="/forgot-password"
          />
        </div>
      </div>
    </main>
  );
}
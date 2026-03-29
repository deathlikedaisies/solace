import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "@/lib/actions/auth";

export default function SignupPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-sm font-medium tracking-[0.22em] text-slate-500 uppercase">
            Create your space
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-900">
            Start a private record you can come back to.
          </h2>
          <p className="max-w-lg text-base leading-7 text-slate-700">
            Set up email and password, then begin keeping your taper notes in one place.
          </p>
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-medium text-primary-700" href="/login">
              Log in
            </Link>
          </p>
        </div>
        <div className="flex justify-center lg:justify-end">
          <AuthForm
            title="Create account"
            description="Email and password only. No public profile. No social features."
            submitLabel="Create account"
            action={signUpAction}
          />
        </div>
      </div>
    </main>
  );
}

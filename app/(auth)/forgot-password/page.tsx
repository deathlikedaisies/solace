import { PasswordResetRequestForm } from "@/components/auth/password-reset-request-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <PasswordResetRequestForm />
    </main>
  );
}
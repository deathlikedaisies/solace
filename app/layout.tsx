import type { Metadata } from "next";
import "./globals.css";
import { DisclaimerBanner } from "@/components/layout/disclaimer-banner";

export const metadata: Metadata = {
  title: "Solace",
  description:
    "A private benzodiazepine taper tracker for logging symptoms, dose changes, and patterns over time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full bg-canvas text-ink font-sans antialiased">
        <div className="relative min-h-screen overflow-x-hidden pb-28">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(127,168,201,0.18),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-24 h-80 bg-[radial-gradient(circle_at_center,rgba(143,191,163,0.14),transparent_60%)]" />
          <div className="relative flex min-h-screen flex-col">{children}</div>
          <DisclaimerBanner />
        </div>
      </body>
    </html>
  );
}

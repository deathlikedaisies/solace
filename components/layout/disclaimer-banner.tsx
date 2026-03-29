export function DisclaimerBanner() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 px-4 md:bottom-4">
      <div className="mx-auto max-w-3xl rounded-full border border-white/70 bg-slate-950/88 px-5 py-3 text-center text-sm text-white shadow-[0_16px_40px_rgba(27,38,50,0.28)] backdrop-blur">
        This tool does not provide medical advice.
      </div>
    </div>
  );
}

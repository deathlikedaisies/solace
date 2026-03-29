import { Card } from "@/components/ui/card";

export default function TimelineLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="h-28 animate-pulse rounded-[1.75rem] bg-white/65"
          />
        ))}
      </div>
      <Card className="h-40 animate-pulse rounded-[2rem] bg-white/65" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[auto_1fr] gap-4">
            <div className="flex flex-col items-center">
              <div className="mt-2 h-3 w-3 rounded-full bg-slate-200" />
              <div className="mt-2 min-h-24 w-px flex-1 bg-slate-200" />
            </div>
            <Card className="h-44 animate-pulse rounded-[1.75rem] bg-white/65" />
          </div>
        ))}
      </div>
    </div>
  );
}

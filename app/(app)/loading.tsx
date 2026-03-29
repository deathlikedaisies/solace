import { Card } from "@/components/ui/card";

export default function ProtectedLoading() {
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
      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <Card className="h-52 animate-pulse rounded-[2rem] bg-white/65" />
        <div className="space-y-6">
          <Card className="h-52 animate-pulse rounded-[2rem] bg-white/65" />
          <Card className="h-40 animate-pulse rounded-[2rem] bg-white/65" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={`chart-${index}`}
            className="h-72 animate-pulse rounded-[1.75rem] bg-white/65"
          />
        ))}
      </div>
    </div>
  );
}

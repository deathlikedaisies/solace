import { EmptyState } from "@/components/feedback/empty-state";
import { TimelineList } from "@/components/timeline/timeline-list";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getTimelineData } from "@/lib/data";

export default async function TimelinePage() {
  const user = await requireUser("/timeline");
  const items = await getTimelineData(user.id);
  const reductionEvents = items.filter(
    (item) => item.kind === "event" && item.eventType === "reduction",
  );
  const holdEvents = items.filter((item) => item.kind === "hold");

  return (
    <div className="space-y-5">
      <Card className="rounded-[2rem] p-6 sm:p-7">
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Timeline
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A simple view of what shifted and what stayed steady.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <LegendPill tone="log">Daily note</LegendPill>
            <LegendPill tone="reduction">Lower dose</LegendPill>
            <LegendPill tone="hold">Steady stretch</LegendPill>
            <LegendPill tone="change">Dose change</LegendPill>
          </div>
          {items.length ? (
            <p className="text-sm text-slate-500">
              {reductionEvents.length} dose change{reductionEvents.length === 1 ? "" : "s"}
              {holdEvents.length
                ? ` and ${holdEvents.length} steadier stretch${holdEvents.length === 1 ? "" : "es"}`
                : ""} shown here.
            </p>
          ) : null}
        </div>
      </Card>

      {items.length ? (
        <TimelineList items={items} />
      ) : (
        <EmptyState
          title="Your timeline will build from here"
          description="Once you start saving notes, this view will help you look back without piecing it together from memory."
          actionHref="/log"
          actionLabel="Open daily log"
        />
      )}
    </div>
  );
}

function LegendPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "log" | "reduction" | "hold" | "change";
}) {
  const classes = {
    log: "bg-primary-100 text-slate-800",
    reduction: "bg-lavender-100 text-slate-800",
    hold: "bg-secondary-100 text-slate-800",
    change: "bg-warm-100 text-slate-700",
  };

  return <span className={`rounded-full px-3 py-1 ${classes[tone]}`}>{children}</span>;
}
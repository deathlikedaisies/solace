import { EmptyState } from "@/components/feedback/empty-state";
import { TimelineList } from "@/components/timeline/timeline-list";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getTimelineData } from "@/lib/data";

export default async function TimelinePage() {
  const user = await requireUser("/timeline");
  const items = await getTimelineData(user.id);
  const doseChanges = items.filter(
    (item) => item.kind === "event" && item.eventType !== "initial",
  );
  const holdEvents = items.filter((item) => item.kind === "hold");

  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] p-6 sm:p-7">
        <div className="space-y-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Timeline
            </h2>
            <p className="mt-2 text-base leading-7 text-slate-700">
              A simple view of what changed and what stayed steady.
            </p>
          </div>
          {items.length ? (
            <p className="text-sm leading-6 text-slate-600">
              {doseChanges.length} dose change{doseChanges.length === 1 ? "" : "s"}
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
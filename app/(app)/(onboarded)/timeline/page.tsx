import { EmptyState } from "@/components/feedback/empty-state";
import { TimelineList } from "@/components/timeline/timeline-list";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getTimelineData } from "@/lib/data";

export default async function TimelinePage() {
  const user = await requireUser("/timeline");
  const items = await getTimelineData(user.id);
  const dailyLogs = items.filter((item) => item.kind === "log");
  const reductionEvents = items.filter(
    (item) => item.kind === "event" && item.eventType === "reduction",
  );
  const holdEvents = items.filter((item) => item.kind === "hold");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Timeline items" value={String(items.length)} />
        <SummaryCard label="Daily logs" value={String(dailyLogs.length)} />
        <SummaryCard label="Dose reductions" value={String(reductionEvents.length)} />
        <SummaryCard label="Hold markers" value={String(holdEvents.length)} />
      </div>

      <Card className="rounded-[2rem] p-6 sm:p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Timeline
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          Review your taper history in date order, with daily logs, recorded dose
          events, and longer holds shown together in one calm view.
        </p>
      </Card>

      {items.length ? (
        <TimelineList items={items} />
      ) : (
        <EmptyState
          title="Your timeline will build as you log"
          description="Save daily check-ins or record dose changes in your data source, and they will appear here in chronological order."
          actionHref="/log"
          actionLabel="Open daily log"
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-[1.75rem] p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
    </Card>
  );
}

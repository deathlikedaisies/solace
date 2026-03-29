import { Card } from "@/components/ui/card";
import type { TimelineItem } from "@/lib/data";
import { cn, formatDate, formatDose } from "@/lib/utils";

type TimelineListProps = {
  items: TimelineItem[];
};

export function TimelineList({ items }: TimelineListProps) {
  return (
    <div className="space-y-5">
      {items.map((item, index) => {
        const previousDate = index > 0 ? items[index - 1]?.date : null;
        const showDateHeader = item.date !== previousDate;

        return (
          <div key={item.id}>
            {showDateHeader ? (
              <div className="mb-3 px-1">
                <p className="text-xs font-medium tracking-[0.22em] text-slate-500 uppercase">
                  {formatDate(item.date)}
                </p>
              </div>
            ) : null}
            <div className="grid grid-cols-[auto_1fr] gap-4 sm:gap-5">
              <div className="flex flex-col items-center">
                <div className={cn("mt-2 h-3 w-3 rounded-full", markerClassName(item))} />
                {index < items.length - 1 ? (
                  <div className="mt-2 min-h-24 w-px flex-1 bg-slate-200/90" />
                ) : null}
              </div>
              <Card className="rounded-[1.75rem] p-5 sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-medium",
                            badgeClassName(item),
                          )}
                        >
                          {labelForItem(item)}
                        </span>
                        <span className="rounded-full bg-warm-100/90 px-3 py-1 text-xs font-medium text-slate-700">
                          {formatDose(item.dose)}
                        </span>
                        {item.kind === "log" && item.severeFlag ? (
                          <span className="rounded-full bg-danger-100 px-3 py-1 text-xs font-medium text-danger-500">
                            Extra support note shown
                          </span>
                        ) : null}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-900">
                        {item.title}
                      </h2>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>
                </div>
                {"note" in item && item.note ? (
                  <div className="mt-4 rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-6 text-slate-700">
                    {item.note}
                  </div>
                ) : null}
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function labelForItem(item: TimelineItem) {
  if (item.kind === "log") {
    return "Daily entry";
  }

  if (item.kind === "hold") {
    return "Stable period";
  }

  if (item.eventType === "reduction") {
    return "Reduction";
  }

  if (item.eventType === "initial") {
    return "Starting point";
  }

  return "Change";
}

function markerClassName(item: TimelineItem) {
  if (item.kind === "log") {
    return "bg-primary-400";
  }

  if (item.kind === "hold") {
    return "bg-secondary-400";
  }

  if (item.eventType === "reduction") {
    return "bg-lavender-300";
  }

  return "bg-slate-300";
}

function badgeClassName(item: TimelineItem) {
  if (item.kind === "log") {
    return "bg-primary-100 text-slate-800";
  }

  if (item.kind === "hold") {
    return "bg-secondary-100 text-slate-800";
  }

  if (item.eventType === "reduction") {
    return "bg-lavender-100 text-slate-800";
  }

  return "bg-warm-100 text-slate-700";
}

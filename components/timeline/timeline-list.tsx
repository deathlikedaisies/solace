import { Card } from "@/components/ui/card";
import type { TimelineItem } from "@/lib/data";
import { getSymptomLabel } from "@/lib/constants";
import { cn, formatDate, formatDose, formatHours } from "@/lib/utils";

type TimelineListProps = {
  items: TimelineItem[];
};

export function TimelineList({ items }: TimelineListProps) {
  return (
    <div className="space-y-7">
      {items.map((item, index) => {
        const previousDate = index > 0 ? items[index - 1]?.date : null;
        const showDateHeader = item.date !== previousDate;

        return (
          <div key={item.id}>
            {showDateHeader ? (
              <div className="mb-3 px-1">
                <p className="text-base font-semibold tracking-tight text-slate-800">
                  {formatDate(item.date)}
                </p>
              </div>
            ) : null}
            <div className="grid grid-cols-[auto_1fr] gap-4 sm:gap-5">
              <div className="flex flex-col items-center">
                <div className={cn("mt-2 h-3 w-3 rounded-full", markerClassName(item))} />
                {index < items.length - 1 ? (
                  <div className="mt-2 min-h-28 w-px flex-1 bg-slate-200/90" />
                ) : null}
              </div>
              <Card className="rounded-[1.75rem] p-5 sm:p-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        badgeClassName(item),
                      )}
                    >
                      {labelForItem(item)}
                    </span>
                    {item.kind === "log" && item.severeFlag ? (
                      <span className="rounded-full bg-danger-100 px-3 py-1 text-xs font-medium text-danger-500">
                        Harder day
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                  </div>

                  {item.kind === "log" ? (
                    <div className="space-y-1 text-base leading-7 text-slate-700">
                      <p><span className="font-medium text-slate-900">Dose</span> {formatDose(item.dose)}</p>
                      <p><span className="font-medium text-slate-900">Anxiety</span> {item.anxiety} / 10</p>
                      <p><span className="font-medium text-slate-900">Mood</span> {item.mood} / 10</p>
                      <p><span className="font-medium text-slate-900">Sleep</span> {formatHours(item.sleepHours)}</p>
                      <p>
                        <span className="font-medium text-slate-900">Symptoms</span>{" "}
                        {item.symptoms.length
                          ? item.symptoms.map((symptom) => getSymptomLabel(symptom)).join(", ")
                          : "None marked"}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-base leading-7 text-slate-700">
                      <p><span className="font-medium text-slate-900">Dose</span> {formatDose(item.dose)}</p>
                    </div>
                  )}
                </div>
                {"note" in item && item.note ? (
                  <div className="mt-4 rounded-[1.5rem] bg-warm-100/90 px-4 py-3 text-sm leading-7 text-slate-700">
                    <p className="font-medium text-slate-900">Note</p>
                    <p className="mt-1">{item.note}</p>
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
    return "Daily note";
  }

  if (item.kind === "hold") {
    return "Steady stretch";
  }

  if (item.eventType === "reduction") {
    return "Lower dose";
  }

  if (item.eventType === "initial") {
    return "Starting dose";
  }

  return "Dose change";
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
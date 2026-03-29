import { Card } from "@/components/ui/card";
import { cn, formatCompactDate } from "@/lib/utils";

type DataPoint = {
  date: string;
  value: number;
};

type MetricChartProps = {
  title: string;
  subtitle: string;
  data: DataPoint[];
  colorClass?: string;
  suffix?: string;
};

export function MetricChart({
  title,
  subtitle,
  data,
  colorClass = "stroke-primary-400",
  suffix = "",
}: MetricChartProps) {
  const width = 320;
  const height = 140;
  const padding = 18;

  if (!data.length) {
    return (
      <Card className="rounded-[1.75rem] p-5">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-5 rounded-[1.5rem] bg-warm-100 px-4 py-8 text-sm text-slate-500">
          No data yet.
        </div>
      </Card>
    );
  }

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = data.length === 1 ? 0 : (width - padding * 2) / (data.length - 1);

  const points = data
    .map((point, index) => {
      const x = padding + index * stepX;
      const y =
        height - padding - ((point.value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const lastValue = data.at(-1)?.value ?? 0;

  return (
    <Card className="rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-warm-100 px-3 py-1 text-xs font-medium text-slate-600">
          {lastValue}
          {suffix}
        </span>
      </div>
      <div className="mt-5 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(238,245,251,0.8))] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
          <defs>
            <linearGradient id={`fill-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(127,168,201,0.35)" />
              <stop offset="100%" stopColor="rgba(127,168,201,0)" />
            </linearGradient>
          </defs>
          <polyline
            fill={`url(#fill-${title})`}
            stroke="none"
            points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          />
          <polyline
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(colorClass)}
            points={points}
          />
          {data.map((point, index) => {
            const x = padding + index * stepX;
            const y =
              height - padding - ((point.value - min) / range) * (height - padding * 2);

            return (
              <circle
                key={`${point.date}-${point.value}`}
                cx={x}
                cy={y}
                r="3.5"
                className="fill-white stroke-primary-400"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>{formatCompactDate(data[0].date)}</span>
          <span>{formatCompactDate(data[data.length - 1].date)}</span>
        </div>
      </div>
    </Card>
  );
}


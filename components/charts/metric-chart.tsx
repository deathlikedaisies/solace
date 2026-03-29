import { Card } from "@/components/ui/card";
import { cn, formatCompactDate } from "@/lib/utils";

type DataPoint = {
  date: string;
  value: number;
};

type ChartMarker = {
  date: string;
  label: string;
};

type MetricChartProps = {
  title: string;
  subtitle: string;
  data: DataPoint[];
  colorClass?: string;
  suffix?: string;
  markers?: ChartMarker[];
};

export function MetricChart({
  title,
  subtitle,
  data,
  colorClass = "stroke-primary-400",
  suffix = "",
  markers = [],
}: MetricChartProps) {
  const width = 320;
  const height = 140;
  const padding = 18;

  if (!data.length) {
    return (
      <Card className="rounded-[1.75rem] p-5">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        <div className="mt-5 rounded-[1.5rem] bg-warm-100/90 px-4 py-8 text-sm text-slate-500">
          No data yet.
        </div>
      </Card>
    );
  }

  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || Math.max(Math.abs(max), 1);
  const stepX = data.length === 1 ? 0 : (width - padding * 2) / (data.length - 1);
  const chartId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const points = data
    .map((point, index) => {
      const x = padding + index * stepX;
      const y =
        height -
        padding -
        ((point.value - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const lastValue = data.at(-1)?.value ?? 0;
  const visibleMarkers = markers.flatMap((marker) => {
    const index = data.findIndex((point) => point.date === marker.date);

    if (index === -1) {
      return [];
    }

    return [
      {
        ...marker,
        x: padding + index * stepX,
      },
    ];
  });

  return (
    <Card className="rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>
        <span className="rounded-full bg-warm-100/90 px-3 py-1 text-xs font-medium text-slate-700">
          {lastValue}
          {suffix}
        </span>
      </div>
      <div className="mt-5 overflow-hidden rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(252,249,244,0.98),rgba(238,245,251,0.92))] p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full">
          <defs>
            <linearGradient id={`fill-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(127,168,201,0.30)" />
              <stop offset="100%" stopColor="rgba(127,168,201,0)" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((fraction) => (
            <line
              key={fraction}
              x1={padding}
              x2={width - padding}
              y1={padding + (height - padding * 2) * fraction}
              y2={padding + (height - padding * 2) * fraction}
              className="stroke-slate-200"
              strokeDasharray="4 6"
            />
          ))}
          {visibleMarkers.map((marker) => (
            <line
              key={`${marker.label}-${marker.date}`}
              x1={marker.x}
              x2={marker.x}
              y1={padding - 2}
              y2={height - padding}
              className="stroke-lavender-300"
              strokeDasharray="4 6"
              strokeWidth="2"
            />
          ))}
          <polyline
            fill={`url(#fill-${chartId})`}
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
              height -
              padding -
              ((point.value - min) / range) * (height - padding * 2);

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
        <div className="mt-2 flex justify-between text-[11px] text-slate-500">
          <span>{formatCompactDate(data[0].date)}</span>
          <span>{formatCompactDate(data[data.length - 1].date)}</span>
        </div>
        {visibleMarkers.length ? (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
            {visibleMarkers.map((marker) => (
              <span
                key={`badge-${marker.label}-${marker.date}`}
                className="rounded-full bg-lavender-100 px-2.5 py-1"
              >
                {marker.label} {formatCompactDate(marker.date)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

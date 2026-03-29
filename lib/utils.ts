export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatCompactDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function formatDose(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0 mg";
  }

  return `${Number(value).toFixed(Number.isInteger(value) ? 0 : 2)} mg`;
}

export function formatHours(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0 h";
  }

  return `${Number(value).toFixed(value % 1 === 0 ? 0 : 1)} h`;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function dateDiffInDays(a: string, b: string) {
  const first = new Date(`${a}T00:00:00`).getTime();
  const second = new Date(`${b}T00:00:00`).getTime();
  return Math.round((first - second) / 86_400_000);
}

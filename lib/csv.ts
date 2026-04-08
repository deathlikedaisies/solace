import type { Database } from "@/lib/database.types";

type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];

const csvHeaders = [
  "date",
  "dose_mg",
  "anxiety",
  "mood",
  "sleep_quality",
  "sleep_hours",
  "symptoms",
  "notes",
  "severe_flag",
  "created_at",
  "updated_at",
] as const;

export function buildDailyLogsCsv(logs: DailyLog[]) {
  const rows = logs.map((log) => [
    log.log_date,
    log.dose === null ? "" : String(log.dose),
    String(log.anxiety),
    String(log.mood),
    String(log.sleep_quality),
    String(log.sleep_hours),
    log.symptoms.join(" | "),
    log.notes ?? "",
    log.severe_flag ? "yes" : "no",
    log.created_at,
    log.updated_at,
  ]);

  return [csvHeaders.join(","), ...rows.map((row) => row.map(escapeCsvValue).join(","))].join("\n");
}

function escapeCsvValue(value: string) {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

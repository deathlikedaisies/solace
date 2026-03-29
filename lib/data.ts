import type { DoseEventType, Database } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { dateDiffInDays, formatDose, formatHours, todayIso } from "@/lib/utils";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];
type DoseEvent = Database["public"]["Tables"]["dose_events"]["Row"];

export type TimelineItem =
  | {
      id: string;
      kind: "log";
      date: string;
      dose: number;
      title: string;
      detail: string;
      note?: string | null;
      severeFlag: boolean;
    }
  | {
      id: string;
      kind: "event";
      date: string;
      dose: number;
      eventType: DoseEventType;
      title: string;
      detail: string;
      note?: string | null;
    }
  | {
      id: string;
      kind: "hold";
      date: string;
      dose: number;
      title: string;
      detail: string;
    };

export async function getProfile(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Profile | null;
}

export function isProfileComplete(profile: Profile | null) {
  return Boolean(profile && profile.starting_dose !== null);
}

export async function getProfileAndLogs(userId: string) {
  const supabase = await createServerSupabaseClient();
  const [{ data: profile, error: profileError }, { data: logs, error: logsError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("log_date", { ascending: true }),
    ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (logsError) {
    throw new Error(logsError.message);
  }

  return {
    profile: (profile as Profile | null) ?? null,
    logs: (logs as DailyLog[] | null) ?? [],
  };
}

export async function getDashboardData(userId: string) {
  const supabase = await createServerSupabaseClient();
  const [
    { data: profile, error: profileError },
    { data: logs, error: logsError },
    { data: events, error: eventsError },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: true }),
    supabase
      .from("dose_events")
      .select("*")
      .eq("user_id", userId)
      .order("event_date", { ascending: true }),
  ]);

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (logsError) {
    throw new Error(logsError.message);
  }

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  const allLogs = (logs as DailyLog[] | null) ?? [];
  const allEvents = (events as DoseEvent[] | null) ?? [];
  const latestLog = allLogs.at(-1) ?? null;
  const todayLog = allLogs.find((log) => log.log_date === todayIso()) ?? null;
  const last7 = allLogs.slice(-7);
  const averages = {
    anxiety: average(last7.map((log) => log.anxiety)),
    mood: average(last7.map((log) => log.mood)),
    sleepHours: average(last7.map((log) => log.sleep_hours)),
    symptomLoad: average(last7.map((log) => log.symptoms.length)),
  };

  return {
    profile: (profile as Profile | null) ?? null,
    logs: allLogs,
    latestLog,
    todayLog,
    events: allEvents,
    recentEvents: allEvents.slice(-8).reverse(),
    averages,
    streak: computeCheckInStreak(allLogs),
  };
}

export async function getJournalData(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as DailyLog[] | null) ?? [];
}

export async function getTimelineData(userId: string) {
  const supabase = await createServerSupabaseClient();
  const [{ data: logs, error: logsError }, { data: events, error: eventsError }] =
    await Promise.all([
      supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .order("log_date", { ascending: true }),
      supabase
        .from("dose_events")
        .select("*")
        .eq("user_id", userId)
        .order("event_date", { ascending: true }),
    ]);

  if (logsError) {
    throw new Error(logsError.message);
  }

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  const dailyLogs = (logs as DailyLog[] | null) ?? [];

  const logItems = dailyLogs.map((log) => ({
    id: `log-${log.id}`,
    kind: "log" as const,
    date: log.log_date,
    dose: log.dose,
    title: "Daily check-in",
    detail: `Dose ${formatDose(log.dose)}. Anxiety ${log.anxiety}/10. Mood ${log.mood}/10. Sleep ${formatHours(log.sleep_hours)}.`,
    note: log.notes,
    severeFlag: log.severe_flag,
  }));

  const eventItems = ((events as DoseEvent[] | null) ?? []).map((event) => ({
    id: `event-${event.id}`,
    kind: "event" as const,
    date: event.event_date,
    dose: event.dose,
    eventType: event.event_type,
    title: doseEventTitle(event.event_type, event.dose),
    detail: timelineEventCopy(event.event_type, event.dose),
    note: event.note,
  }));

  const holdItems = inferHoldMarkers(dailyLogs);

  return [...logItems, ...eventItems, ...holdItems].sort((a, b) =>
    a.date > b.date ? 1 : -1,
  );
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1),
  );
}

function computeCheckInStreak(logs: DailyLog[]) {
  if (!logs.length) {
    return 0;
  }

  let streak = 1;

  for (let index = logs.length - 1; index > 0; index -= 1) {
    const current = logs[index];
    const previous = logs[index - 1];

    if (dateDiffInDays(current.log_date, previous.log_date) === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function doseEventTitle(eventType: DoseEventType, dose: number) {
  if (eventType === "initial") {
    return `Starting point set at ${formatDose(dose)}`;
  }

  if (eventType === "reduction") {
    return `Dose reduced to ${formatDose(dose)}`;
  }

  return `Dose updated to ${formatDose(dose)}`;
}

function timelineEventCopy(eventType: DoseEventType, dose: number) {
  if (eventType === "initial") {
    return `Initial taper record added at ${formatDose(dose)}.`;
  }

  if (eventType === "reduction") {
    return `Reduction marker recorded at ${formatDose(dose)}.`;
  }

  return `Dose increase or correction recorded at ${formatDose(dose)}.`;
}

function inferHoldMarkers(logs: DailyLog[]): TimelineItem[] {
  if (logs.length < 7) {
    return [];
  }

  const markers: TimelineItem[] = [];
  let streakStart = logs[0];
  let streakCount = 1;

  for (let index = 1; index <= logs.length; index += 1) {
    const current = logs[index];
    const previous = logs[index - 1];
    const continuing =
      current &&
      current.dose === previous.dose &&
      dateDiffInDays(current.log_date, previous.log_date) === 1;

    if (continuing) {
      streakCount += 1;
      continue;
    }

    if (streakCount >= 7) {
      markers.push({
        id: `hold-${streakStart.log_date}-${streakStart.dose}`,
        kind: "hold",
        date: streakStart.log_date,
        dose: streakStart.dose,
        title: "Hold marker",
        detail: `${streakCount}-day hold at ${formatDose(streakStart.dose)}.`,
      });
    }

    streakStart = current ?? previous;
    streakCount = 1;
  }

  return markers;
}

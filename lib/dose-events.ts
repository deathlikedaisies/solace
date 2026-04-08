import type { DoseEventType } from "@/lib/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type KnownDose = {
  date: string;
  dose: number;
};

export async function ensureInitialDoseEvent({
  userId,
  eventDate,
  dose,
}: {
  userId: string;
  eventDate: string;
  dose: number;
}) {
  const supabase = await createServerSupabaseClient();

  const { data: matchingInitial, error: matchingError } = await supabase
    .from("dose_events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "initial")
    .eq("event_date", eventDate)
    .eq("dose", dose)
    .limit(1);

  if (matchingError) {
    throw new Error(matchingError.message);
  }

  if (matchingInitial?.length) {
    return;
  }

  const { data: existingInitial, error: existingError } = await supabase
    .from("dose_events")
    .select("id")
    .eq("user_id", userId)
    .eq("event_type", "initial")
    .is("source_log_id", null)
    .order("event_date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingInitial) {
    const { error: updateError } = await supabase
      .from("dose_events")
      .update({
        event_date: eventDate,
        dose,
      })
      .eq("id", existingInitial.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return;
  }

  const { error: insertError } = await supabase.from("dose_events").insert({
    user_id: userId,
    event_date: eventDate,
    dose,
    event_type: "initial",
  });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

export async function syncDoseEventForDailyLog({
  userId,
  logId,
  logDate,
  dose,
}: {
  userId: string;
  logId: string;
  logDate: string;
  dose: number | null;
}) {
  const supabase = await createServerSupabaseClient();

  const { data: linkedEvent, error: linkedError } = await supabase
    .from("dose_events")
    .select("id, event_date, dose, event_type, source_log_id")
    .eq("user_id", userId)
    .eq("source_log_id", logId)
    .maybeSingle();

  if (linkedError) {
    throw new Error(linkedError.message);
  }

  if (dose === null) {
    if (linkedEvent) {
      const { error: deleteError } = await supabase
        .from("dose_events")
        .delete()
        .eq("id", linkedEvent.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    return;
  }

  const previousKnownDose = await getPreviousKnownDose({
    userId,
    logDate,
    excludeSourceLogId: logId,
  });

  if (!previousKnownDose || dose === previousKnownDose.dose) {
    if (linkedEvent) {
      const { error: deleteError } = await supabase
        .from("dose_events")
        .delete()
        .eq("id", linkedEvent.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    return;
  }

  const eventType: DoseEventType = dose < previousKnownDose.dose ? "reduction" : "increase";

  const { data: matchingEventRows, error: matchingError } = await supabase
    .from("dose_events")
    .select("id, source_log_id")
    .eq("user_id", userId)
    .eq("event_date", logDate)
    .eq("dose", dose)
    .eq("event_type", eventType)
    .order("created_at", { ascending: true })
    .limit(1);

  if (matchingError) {
    throw new Error(matchingError.message);
  }

  const matchingEvent = matchingEventRows?.[0] ?? null;

  if (matchingEvent) {
    if (!matchingEvent.source_log_id) {
      const { error: attachError } = await supabase
        .from("dose_events")
        .update({ source_log_id: logId })
        .eq("id", matchingEvent.id);

      if (attachError) {
        throw new Error(attachError.message);
      }
    }

    if (linkedEvent && linkedEvent.id !== matchingEvent.id) {
      const { error: deleteError } = await supabase
        .from("dose_events")
        .delete()
        .eq("id", linkedEvent.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }

    return;
  }

  if (linkedEvent) {
    const { error: updateError } = await supabase
      .from("dose_events")
      .update({
        event_date: logDate,
        dose,
        event_type: eventType,
      })
      .eq("id", linkedEvent.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return;
  }

  const { error: insertError } = await supabase.from("dose_events").insert({
    user_id: userId,
    event_date: logDate,
    dose,
    event_type: eventType,
    source_log_id: logId,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

async function getPreviousKnownDose({
  userId,
  logDate,
  excludeSourceLogId,
}: {
  userId: string;
  logDate: string;
  excludeSourceLogId: string;
}) {
  const supabase = await createServerSupabaseClient();

  const [previousLogResult, previousEventResult] = await Promise.all([
    supabase
      .from("daily_logs")
      .select("log_date, dose")
      .eq("user_id", userId)
      .lt("log_date", logDate)
      .not("dose", "is", null)
      .order("log_date", { ascending: false })
      .limit(1),
    supabase
      .from("dose_events")
      .select("event_date, dose, source_log_id, created_at")
      .eq("user_id", userId)
      .lte("event_date", logDate)
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (previousLogResult.error) {
    throw new Error(previousLogResult.error.message);
  }

  if (previousEventResult.error) {
    throw new Error(previousEventResult.error.message);
  }

  const previousLog = previousLogResult.data?.[0]
    ? {
        date: previousLogResult.data[0].log_date,
        dose: previousLogResult.data[0].dose as number,
      }
    : null;

  const previousEvent =
    previousEventResult.data
      ?.filter((event) => event.source_log_id !== excludeSourceLogId)
      .map((event) => ({ date: event.event_date, dose: event.dose }))
      .at(0) ?? null;

  return pickLatestKnownDose(previousLog, previousEvent);
}

function pickLatestKnownDose(
  previousLog: KnownDose | null,
  previousEvent: KnownDose | null,
) {
  if (!previousLog) {
    return previousEvent;
  }

  if (!previousEvent) {
    return previousLog;
  }

  if (previousEvent.date >= previousLog.date) {
    return previousEvent;
  }

  return previousLog;
}

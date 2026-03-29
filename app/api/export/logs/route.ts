import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildDailyLogsCsv } from "@/lib/csv";
import { todayIso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Please log in again to export.", { status: 401 });
  }

  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("log_date", { ascending: true });

  if (error) {
    return new Response("We couldn't prepare your export right now. Please try again.", {
      status: 500,
    });
  }

  const csv = buildDailyLogsCsv(data ?? []);
  const filename = `solace-daily-logs-${todayIso()}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

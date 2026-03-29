import { EmptyState } from "@/components/feedback/empty-state";
import { ExportLogsButton } from "@/components/export/export-logs-button";
import { JournalHistory } from "@/components/journal/history-list";
import { Card } from "@/components/ui/card";
import { getJournalData } from "@/lib/data";
import { requireUser } from "@/lib/auth";

export default async function JournalPage() {
  const user = await requireUser("/journal");
  const logs = await getJournalData(user.id);

  return (
    <div className="space-y-6">
      <Card className="rounded-[2rem] p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Journal
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Look back when you want context, not just numbers.
            </p>
          </div>
          <ExportLogsButton disabled={!logs.length} />
        </div>
      </Card>

      {logs.length ? (
        <JournalHistory logs={logs} />
      ) : (
        <EmptyState
          title="No entries yet"
          description="Your journal begins with the first entry you save."
          actionHref="/log"
          actionLabel="Open daily log"
          secondaryAction={<ExportLogsButton disabled />}
        />
      )}
    </div>
  );
}

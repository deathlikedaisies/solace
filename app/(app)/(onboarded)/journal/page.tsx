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
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Review past entries in a simple quiet history view and narrow the list
              with basic date filters when you need less visual noise.
            </p>
          </div>
          <ExportLogsButton disabled={!logs.length} />
        </div>
      </Card>

      {logs.length ? (
        <JournalHistory logs={logs} />
      ) : (
        <EmptyState
          title="No journal entries yet"
          description="Your daily check-ins will begin building a private history here once you save the first one."
          actionHref="/log"
          actionLabel="Open daily log"
          secondaryAction={<ExportLogsButton disabled />}
        />
      )}
    </div>
  );
}

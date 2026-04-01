import type { Database } from "@/lib/database.types";
import { getSymptomLabel } from "@/lib/constants";
import { getApproximateDiazepamEquivalent } from "@/lib/benzodiazepines";
import {
  formatCompactDate,
  formatDate,
  formatDose,
  formatHours,
  shiftIsoDate,
  todayIso,
} from "@/lib/utils";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type DailyLog = Database["public"]["Tables"]["daily_logs"]["Row"];

type DoctorVisitSummarySection = {
  title: string;
  lines: string[];
};

export type DoctorVisitSummary = {
  recentWindowLabel: string;
  sections: DoctorVisitSummarySection[];
  disclaimer: string;
  text: string;
};

const communicationItems = [
  "Taper guidance",
  "Symptom understanding",
  "Symptom management",
] as const;

const disclaimer = "This summary is based on your entries and is not medical advice.";

export function buildDoctorVisitSummary(
  profile: Profile,
  logs: DailyLog[],
): DoctorVisitSummary {
  const windowEnd = logs.at(-1)?.log_date ?? todayIso();
  const windowStart = shiftIsoDate(windowEnd, -13);
  const recentLogs = logs.filter(
    (log) => log.log_date >= windowStart && log.log_date <= windowEnd,
  );
  const recentWindowLabel = describeWindow(windowStart, windowEnd);
  const recentSleepAverage = average(recentLogs.map((log) => log.sleep_hours));
  const symptomDays = recentLogs.filter((log) => log.symptoms.length > 0).length;
  const symptomTrend = describeSymptomTrend(recentLogs, logs);
  const topSymptoms = getTopSymptoms(recentLogs);
  const recentNotes = logs
    .filter((log) => Boolean(log.notes?.trim()))
    .slice(-2)
    .reverse()
    .map((log) => `${formatDate(log.log_date)}: ${compactNote(log.notes ?? "")}`);
  const impactLines = buildImpactLines(recentLogs, recentSleepAverage);
  const diazepamReference = getApproximateDiazepamEquivalent(
    profile.benzo_name,
    profile.current_dose,
  );
  const doctorLines = buildDoctorLines({
    profile,
    recentLogs,
    recentWindowLabel,
    recentSleepAverage,
    symptomDays,
    symptomTrend,
    topSymptoms,
    recentNotes,
    impactLines,
  });

  const medicationLines = [
    `Medication: ${profile.benzo_name}`,
    `Taper start date: ${formatDate(profile.taper_start_date)}`,
    `Current dose: ${formatDose(profile.current_dose)}`,
  ];

  if (diazepamReference) {
    medicationLines.push(`Approximate diazepam reference: ${diazepamReference.summaryShort}`);
  }

  const sections: DoctorVisitSummarySection[] = [
    {
      title: "Medication info",
      lines: medicationLines,
    },
    {
      title: `Recent pattern (${recentWindowLabel})`,
      lines: [
        recentLogs.length
          ? `Average sleep: ${formatHours(recentSleepAverage)}`
          : "Average sleep: Still taking shape from your recent entries.",
        recentLogs.length
          ? `Symptoms showed up on ${symptomDays} of the ${recentLogs.length} day${recentLogs.length === 1 ? "" : "s"} you logged in this stretch.`
          : "Symptoms: Still taking shape from your recent entries.",
        `Overall pattern: ${symptomTrend}.`,
      ],
    },
    {
      title: "Most frequent symptoms",
      lines: topSymptoms.length
        ? topSymptoms
        : ["No symptom pattern stands out yet from the recent entries."],
    },
    {
      title: "Recent notes",
      lines: recentNotes.length ? recentNotes : ["No recent notes yet."],
    },
    {
      title: "How this has been feeling lately",
      lines: impactLines,
    },
    {
      title: "What I can say to my doctor",
      lines: doctorLines,
    },
    {
      title: "What I would like help with",
      lines: [...communicationItems],
    },
  ];

  const text = [
    "Prepare for appointment",
    "",
    ...sections.flatMap((section) => [
      section.title,
      ...section.lines.map((line) => `- ${line}`),
      "",
    ]),
    disclaimer,
  ]
    .join("\n")
    .trim();

  return {
    recentWindowLabel,
    sections,
    disclaimer,
    text,
  };
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1),
  );
}

function describeWindow(start: string, end: string) {
  return start === end
    ? formatCompactDate(end)
    : `${formatCompactDate(start)} to ${formatCompactDate(end)}`;
}

function describeSymptomTrend(recentLogs: DailyLog[], allLogs: DailyLog[]) {
  const recent = recentLogs.slice(-7);
  const earlier = allLogs.filter((log) => log.log_date < (recent[0]?.log_date ?? "")).slice(-7);

  if (recent.length < 3 || earlier.length < 3) {
    return "still taking shape in the recent entries";
  }

  const recentAverage = average(recent.map((log) => log.symptoms.length));
  const earlierAverage = average(earlier.map((log) => log.symptoms.length));

  if (recentAverage >= earlierAverage + 0.75) {
    return "a little heavier lately";
  }

  if (recentAverage <= earlierAverage - 0.75) {
    return "a little lighter lately";
  }

  return "fairly steady lately";
}

function getTopSymptoms(logs: DailyLog[]) {
  const counts = new Map<string, number>();

  for (const log of logs) {
    for (const symptom of log.symptoms) {
      counts.set(symptom, (counts.get(symptom) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 7)
    .map(([symptom, count]) => `${getSymptomLabel(symptom)} (${count} day${count === 1 ? "" : "s"})`);
}

function compactNote(note: string) {
  const compact = note.replace(/\s+/g, " ").trim();

  if (compact.length <= 180) {
    return compact;
  }

  return `${compact.slice(0, 177).trimEnd()}...`;
}

function buildImpactLines(logs: DailyLog[], sleepAverage: number) {
  if (!logs.length) {
    return ["The day-to-day picture is still taking shape in your entries."];
  }

  const symptomDays = logs.filter((log) => log.symptoms.length > 0).length;
  const lines: string[] = [];

  if (symptomDays >= Math.max(3, Math.ceil(logs.length * 0.6))) {
    lines.push("Symptoms have been showing up on most days.");
  }

  const anxietyAverage = average(logs.map((log) => log.anxiety));
  const moodAverage = average(logs.map((log) => log.mood));

  if (sleepAverage < 6 || anxietyAverage >= 6 || moodAverage <= 4) {
    lines.push("The recent entries suggest this has been making day-to-day life harder at times.");
  }

  if (!lines.length) {
    lines.push("The day-to-day impact looks mixed in the recent entries.");
  }

  return lines;
}

function buildDoctorLines({
  profile,
  recentLogs,
  recentWindowLabel,
  recentSleepAverage,
  symptomDays,
  symptomTrend,
  topSymptoms,
  recentNotes,
  impactLines,
}: {
  profile: Profile;
  recentLogs: DailyLog[];
  recentWindowLabel: string;
  recentSleepAverage: number;
  symptomDays: number;
  symptomTrend: string;
  topSymptoms: string[];
  recentNotes: string[];
  impactLines: string[];
}) {
  const lines = [
    `I'm tapering ${profile.benzo_name}. I started on ${formatDate(profile.taper_start_date)} and I'm currently at ${formatDose(profile.current_dose)}.`,
  ];

  if (recentLogs.length) {
    lines.push(
      `Over ${recentWindowLabel}, I've averaged ${formatHours(recentSleepAverage)} of sleep, and symptoms have shown up on ${symptomDays} of the ${recentLogs.length} day${recentLogs.length === 1 ? "" : "s"} I logged.`,
    );
    lines.push(`Overall, things have felt ${symptomTrend}.`);
  } else {
    lines.push("I only have a few entries so far, but I wanted to bring what I've been tracking.");
  }

  if (topSymptoms.length) {
    lines.push(
      `The symptoms I've noticed most often are ${naturalList(topSymptoms.map(stripCountSuffix))}.`,
    );
  } else {
    lines.push("I haven't logged a clear symptom pattern yet, but I wanted to share what I have so far.");
  }

  if (recentNotes.length) {
    lines.push(`A recent note I wrote was: \"${extractNoteText(recentNotes[0])}\"`);
  }

  if (impactLines.length) {
    lines.push(firstPersonImpactLine(impactLines));
  }

  lines.push(
    "I'd like help understanding the taper, the symptoms I'm noticing, and how to talk through what might help me manage them.",
  );

  return lines;
}

function stripCountSuffix(label: string) {
  return label.replace(/ \(\d+ day(s)?\)$/, "");
}

function extractNoteText(line: string) {
  const parts = line.split(": ");
  return (parts.slice(1).join(": ") || line).trim();
}

function naturalList(items: string[]) {
  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
}

function firstPersonImpactLine(lines: string[]) {
  if (lines.some((line) => line.includes("making day-to-day life harder"))) {
    return "This has been affecting my day-to-day life at times.";
  }

  if (lines.some((line) => line.includes("showing up on most days"))) {
    return "These symptoms have been showing up on most days for me.";
  }

  return "The day-to-day impact has felt mixed, but I still wanted to mention it.";
}
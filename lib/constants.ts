export const symptomOptions = [
  "Restlessness",
  "Insomnia",
  "Headache",
  "Muscle tension",
  "Muscle pain",
  "Nausea",
  "GI upset",
  "Dizziness",
  "Palpitations",
  "Sensory sensitivity",
  "Sound sensitivity",
  "Visual sensitivity",
  "Tremor",
  "Sweating",
  "Brain fog",
  "Fatigue",
  "Irritability",
  "Panic surges",
  "Intrusive thoughts",
  "Depersonalization",
  "Tingling or numbness",
  "Burning skin",
  "Tinnitus",
  "Blurred vision",
  "Akathisia",
  "Confusion",
  "Hallucinations",
  "Seizure-like symptoms",
] as const;

export const severeSymptoms = [
  "Palpitations",
  "Depersonalization",
  "Confusion",
  "Hallucinations",
  "Seizure-like symptoms",
] as const;

export const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log", label: "Log" },
  { href: "/timeline", label: "Timeline" },
  { href: "/journal", label: "Journal" },
] as const;

export const homeHighlights = [
  "A private space for dose, symptom, mood, and sleep notes",
  "Quick daily entries that stay easy to return to",
  "Patterns that help you notice what tends to follow a dose change",
] as const;

export const safetyPrompt =
  "If today's symptoms feel severe or unsafe, contact your healthcare provider or local emergency services.";

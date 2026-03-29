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
  "A calm private space for benzodiazepine taper tracking",
  "Fast daily logging designed for low friction on mobile",
  "Dose, symptom, mood, and sleep patterns shown side by side",
] as const;

export const safetyPrompt =
  "If today's symptoms feel severe or unsafe, contact your healthcare provider or local emergency services.";

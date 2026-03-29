export const symptomOptions = [
  "Restlessness",
  "Insomnia",
  "Headache",
  "Muscle tension",
  "Nausea",
  "Dizziness",
  "Palpitations",
  "Sensory sensitivity",
  "Tremor",
  "Irritability",
  "Brain fog",
  "Depersonalization",
] as const;

export const severeSymptoms = ["Palpitations", "Depersonalization"] as const;

export const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/log", label: "Log" },
  { href: "/timeline", label: "Timeline" },
  { href: "/journal", label: "Journal" },
] as const;

export const homeHighlights = [
  "A calm private space for benzodiazepine taper tracking",
  "Fast daily logging designed for low friction on mobile",
  "A soft minimal interface without clinical language or noise",
] as const;

export const safetyPrompt =
  "If today's symptoms feel severe or unsafe, contact your healthcare provider or local emergency services.";

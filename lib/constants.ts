export const symptomOptions = [
  "Insomnia",
  "Headache",
  "Head pressure",
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

export type SymptomValue = (typeof symptomOptions)[number];

export const symptomLabels: Record<SymptomValue, string> = {
  Insomnia: "Insomnia",
  Headache: "Headache",
  "Head pressure": "Head pressure",
  "Muscle tension": "Muscle tension",
  "Muscle pain": "Muscle pain",
  Nausea: "Nausea",
  "GI upset": "Stomach issues",
  Dizziness: "Dizziness",
  Palpitations: "Heart racing / pounding",
  "Sensory sensitivity": "Sensitive to light or sound",
  "Sound sensitivity": "Noise sensitivity",
  "Visual sensitivity": "Light sensitivity",
  Tremor: "Tremor",
  Sweating: "Sweating",
  "Brain fog": "Brain fog",
  Fatigue: "Fatigue",
  Irritability: "Irritability",
  "Panic surges": "Panic surges",
  "Intrusive thoughts": "Intrusive thoughts",
  Depersonalization: "Feeling disconnected / unreal",
  "Tingling or numbness": "Tingling or numbness",
  "Burning skin": "Burning sensation",
  Tinnitus: "Tinnitus",
  "Blurred vision": "Blurred vision",
  Akathisia: "Restlessness (can't sit still)",
  Confusion: "Hard to think clearly",
  Hallucinations: "Seeing or hearing things",
  "Seizure-like symptoms": "Seizure-like sensations",
};

export function getSymptomLabel(symptom: string) {
  if (symptom in symptomLabels) {
    return symptomLabels[symptom as SymptomValue];
  }

  return symptom;
}

export const symptomGroups: Array<{
  title: string;
  symptoms: SymptomValue[];
}> = [
  {
    title: "Mind & mood",
    symptoms: [
      "Irritability",
      "Intrusive thoughts",
      "Confusion",
      "Depersonalization",
      "Panic surges",
    ],
  },
  {
    title: "Body",
    symptoms: [
      "Headache",
      "Head pressure",
      "Muscle tension",
      "Muscle pain",
      "Nausea",
      "GI upset",
      "Palpitations",
      "Sweating",
      "Tremor",
      "Burning skin",
    ],
  },
  {
    title: "Sleep",
    symptoms: ["Insomnia", "Fatigue"],
  },
  {
    title: "Sensory",
    symptoms: [
      "Visual sensitivity",
      "Sound sensitivity",
      "Blurred vision",
      "Tinnitus",
    ],
  },
  {
    title: "Other",
    symptoms: [
      "Dizziness",
      "Brain fog",
      "Tingling or numbness",
      "Akathisia",
      "Hallucinations",
      "Seizure-like symptoms",
    ],
  },
];

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
  "Your dose, symptoms, mood, and sleep in one private record",
  "Quick notes that stay easy to return to",
  "A clearer view of what tends to follow a dose change",
] as const;

export const safetyPrompt =
  "If today's symptoms feel severe or unsafe, contact your healthcare provider or local emergency services.";
import { formatDose } from "@/lib/utils";

export const benzodiazepineOptions = [
  "Alprazolam",
  "Clonazepam",
  "Diazepam",
  "Lorazepam",
  "Oxazepam",
  "Temazepam",
  "Chlordiazepoxide",
  "Clobazam",
  "Clorazepate",
  "Flurazepam",
  "Triazolam",
  "Other / not listed",
] as const;

export type BenzodiazepineOption = (typeof benzodiazepineOptions)[number];

type FixedReference = {
  kind: "fixed";
  medicationMg: number;
  diazepamMg: number;
};

type RangeReference = {
  kind: "range";
  medicationMgLow: number;
  medicationMgHigh: number;
  diazepamMg: number;
};

type BenzodiazepineReference = {
  label: BenzodiazepineOption;
  reference: FixedReference | RangeReference | null;
};

const referenceTable: Record<BenzodiazepineOption, BenzodiazepineReference> = {
  Alprazolam: {
    label: "Alprazolam",
    reference: { kind: "fixed", medicationMg: 0.5, diazepamMg: 10 },
  },
  Clonazepam: {
    label: "Clonazepam",
    reference: { kind: "fixed", medicationMg: 0.5, diazepamMg: 10 },
  },
  Diazepam: {
    label: "Diazepam",
    reference: { kind: "fixed", medicationMg: 10, diazepamMg: 10 },
  },
  Lorazepam: {
    label: "Lorazepam",
    reference: { kind: "fixed", medicationMg: 1, diazepamMg: 10 },
  },
  Oxazepam: {
    label: "Oxazepam",
    reference: { kind: "fixed", medicationMg: 20, diazepamMg: 10 },
  },
  Temazepam: {
    label: "Temazepam",
    reference: { kind: "fixed", medicationMg: 20, diazepamMg: 10 },
  },
  Chlordiazepoxide: {
    label: "Chlordiazepoxide",
    reference: { kind: "fixed", medicationMg: 25, diazepamMg: 10 },
  },
  Clobazam: {
    label: "Clobazam",
    reference: { kind: "fixed", medicationMg: 20, diazepamMg: 10 },
  },
  Clorazepate: {
    label: "Clorazepate",
    reference: { kind: "fixed", medicationMg: 15, diazepamMg: 10 },
  },
  Flurazepam: {
    label: "Flurazepam",
    reference: {
      kind: "range",
      medicationMgLow: 15,
      medicationMgHigh: 30,
      diazepamMg: 10,
    },
  },
  Triazolam: {
    label: "Triazolam",
    reference: { kind: "fixed", medicationMg: 0.5, diazepamMg: 10 },
  },
  "Other / not listed": {
    label: "Other / not listed",
    reference: null,
  },
};

export type DiazepamEquivalentEstimate =
  | {
      kind: "diazepam";
      medication: BenzodiazepineOption;
      dose: number;
      summary: string;
      summaryShort: string;
      caution: string;
      cautionDetail: string;
    }
  | {
      kind: "fixed";
      medication: BenzodiazepineOption;
      dose: number;
      diazepamEquivalent: number;
      summary: string;
      summaryShort: string;
      caution: string;
      cautionDetail: string;
    }
  | {
      kind: "range";
      medication: BenzodiazepineOption;
      dose: number;
      diazepamEquivalentLow: number;
      diazepamEquivalentHigh: number;
      summary: string;
      summaryShort: string;
      caution: string;
      cautionDetail: string;
    };

export function getApproximateDiazepamEquivalent(
  medication: string | null | undefined,
  dose: number | null | undefined,
): DiazepamEquivalentEstimate | null {
  if (!medication || dose === null || dose === undefined || Number.isNaN(dose) || dose <= 0) {
    return null;
  }

  if (!isKnownBenzodiazepine(medication)) {
    return null;
  }

  const reference = referenceTable[medication].reference;

  if (!reference) {
    return null;
  }

  if (medication === "Diazepam") {
    return {
      kind: "diazepam",
      medication,
      dose,
      summary: "Your current dose is already diazepam.",
      summaryShort: "Current dose is already diazepam.",
      caution: "Approximate only. Different sources use slightly different estimates.",
      cautionDetail:
        "Individual response varies. Do not use this alone to change your medication. Review medication changes with your clinician.",
    };
  }

  if (reference.kind === "fixed") {
    const diazepamEquivalent = roundEstimate((dose / reference.medicationMg) * reference.diazepamMg);

    return {
      kind: "fixed",
      medication,
      dose,
      diazepamEquivalent,
      summary: `Your current dose is roughly similar to ${formatDose(diazepamEquivalent)} of diazepam.`,
      summaryShort: `Roughly similar to ${formatDose(diazepamEquivalent)} diazepam.`,
      caution: "Approximate only. Different sources use slightly different estimates.",
      cautionDetail:
        "Individual response varies. Do not use this alone to change your medication. Review medication changes with your clinician.",
    };
  }

  const diazepamEquivalentLow = roundEstimate(
    (dose / reference.medicationMgHigh) * reference.diazepamMg,
  );
  const diazepamEquivalentHigh = roundEstimate(
    (dose / reference.medicationMgLow) * reference.diazepamMg,
  );

  return {
    kind: "range",
    medication,
    dose,
    diazepamEquivalentLow,
    diazepamEquivalentHigh,
    summary: `Your current dose is roughly similar to about ${formatDose(diazepamEquivalentLow)} to ${formatDose(diazepamEquivalentHigh)} of diazepam.`,
    summaryShort: `Roughly similar to about ${formatDose(diazepamEquivalentLow)} to ${formatDose(diazepamEquivalentHigh)} diazepam.`,
    caution: "Approximate only. Different sources use slightly different estimates. This estimate is broader for flurazepam.",
    cautionDetail:
      "Individual response varies. Do not use this alone to change your medication. Review medication changes with your clinician.",
  };
}

export function isKnownBenzodiazepine(value: string): value is BenzodiazepineOption {
  return benzodiazepineOptions.includes(value as BenzodiazepineOption);
}

function roundEstimate(value: number) {
  return Number(value.toFixed(value >= 10 || Number.isInteger(value) ? 0 : 1));
}
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

const defaultCaution = "Approximate only. Different sources use slightly different estimates.";
const defaultCautionDetail =
  "Individual response varies. Do not use this alone to change your medication. Review medication changes with your clinician.";

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
  if (
    !medication ||
    dose === null ||
    dose === undefined ||
    Number.isNaN(dose) ||
    !Number.isFinite(dose) ||
    dose <= 0
  ) {
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
      caution: defaultCaution,
      cautionDetail: defaultCautionDetail,
    };
  }

  if (reference.kind === "fixed") {
    const diazepamEquivalent = roundEstimate((dose / reference.medicationMg) * reference.diazepamMg);
    const formattedEquivalent = formatApproximateDose(diazepamEquivalent);

    return {
      kind: "fixed",
      medication,
      dose,
      diazepamEquivalent,
      summary: `Your current dose is roughly similar to ${formattedEquivalent} of diazepam.`,
      summaryShort: `Roughly similar to ${formattedEquivalent} diazepam.`,
      caution: defaultCaution,
      cautionDetail: defaultCautionDetail,
    };
  }

  const diazepamEquivalentLow = roundEstimate(
    (dose / reference.medicationMgHigh) * reference.diazepamMg,
  );
  const diazepamEquivalentHigh = roundEstimate(
    (dose / reference.medicationMgLow) * reference.diazepamMg,
  );
  const formattedLow = formatApproximateDose(diazepamEquivalentLow);
  const formattedHigh = formatApproximateDose(diazepamEquivalentHigh);

  return {
    kind: "range",
    medication,
    dose,
    diazepamEquivalentLow,
    diazepamEquivalentHigh,
    summary: `Your current dose is roughly similar to about ${formattedLow} to ${formattedHigh} of diazepam.`,
    summaryShort: `Roughly similar to about ${formattedLow} to ${formattedHigh} diazepam.`,
    caution: `${defaultCaution} This estimate is broader for flurazepam.`,
    cautionDetail: defaultCautionDetail,
  };
}

export function isKnownBenzodiazepine(value: string): value is BenzodiazepineOption {
  return benzodiazepineOptions.includes(value as BenzodiazepineOption);
}

export function formatApproximateDose(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 mg";
  }

  if (value < 0.1) {
    return "< 0.1 mg";
  }

  if (Number.isInteger(value)) {
    return formatDose(value);
  }

  return `${value.toFixed(1)} mg`;
}

function roundEstimate(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  if (value < 0.1) {
    return Number(value.toFixed(2));
  }

  if (Number.isInteger(value)) {
    return value;
  }

  return Number(value.toFixed(1));
}
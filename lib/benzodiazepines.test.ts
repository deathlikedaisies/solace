import { describe, expect, test } from "vitest";
import {
  formatApproximateDose,
  getApproximateDiazepamEquivalent,
} from "@/lib/benzodiazepines";

describe("getApproximateDiazepamEquivalent", () => {
  test.each([
    ["Alprazolam", 0.5, 10],
    ["Clonazepam", 0.5, 10],
    ["Lorazepam", 1, 10],
    ["Oxazepam", 20, 10],
    ["Temazepam", 20, 10],
    ["Chlordiazepoxide", 25, 10],
    ["Clobazam", 20, 10],
    ["Clorazepate", 15, 10],
    ["Triazolam", 0.5, 10],
  ])("maps %s %s mg to about %s mg diazepam", (medication, dose, expected) => {
    const estimate = getApproximateDiazepamEquivalent(medication, dose);

    expect(estimate).not.toBeNull();
    expect(estimate?.kind).toBe("fixed");
    if (estimate?.kind === "fixed") {
      expect(estimate.diazepamEquivalent).toBe(expected);
      expect(estimate.summary).toContain(`${expected} mg`);
      expect(estimate.caution).toContain("Approximate only");
      expect(estimate.cautionDetail).toContain("Do not use this alone");
    }
  });

  test("treats diazepam as no conversion needed", () => {
    const estimate = getApproximateDiazepamEquivalent("Diazepam", 10);

    expect(estimate?.kind).toBe("diazepam");
    expect(estimate?.summary).toContain("already diazepam");
  });

  test("returns no estimate for other medications", () => {
    expect(getApproximateDiazepamEquivalent("Other / not listed", 1)).toBeNull();
  });

  test("returns no estimate for blank or zero dose", () => {
    expect(getApproximateDiazepamEquivalent("Lorazepam", null)).toBeNull();
    expect(getApproximateDiazepamEquivalent("Lorazepam", 0)).toBeNull();
  });

  test("returns no estimate for non-finite dose values", () => {
    expect(getApproximateDiazepamEquivalent("Lorazepam", Number.POSITIVE_INFINITY)).toBeNull();
  });

  test("keeps very small positive results conservative", () => {
    const estimate = getApproximateDiazepamEquivalent("Alprazolam", 0.001);

    expect(estimate?.kind).toBe("fixed");
    expect(estimate?.summary).toContain("< 0.1 mg");
  });

  test("shows one decimal place at most for non-integer results", () => {
    const estimate = getApproximateDiazepamEquivalent("Lorazepam", 0.25);

    expect(estimate?.kind).toBe("fixed");
    expect(estimate?.summary).toContain("2.5 mg");
    expect(estimate?.summary).not.toContain("2.50");
  });

  test("uses broader range wording for flurazepam", () => {
    const estimate = getApproximateDiazepamEquivalent("Flurazepam", 30);

    expect(estimate?.kind).toBe("range");
    if (estimate?.kind === "range") {
      expect(estimate.diazepamEquivalentLow).toBe(10);
      expect(estimate.diazepamEquivalentHigh).toBe(20);
      expect(estimate.summary).toContain("10 mg to 20 mg");
      expect(estimate.caution).toContain("broader for flurazepam");
    }
  });
});

describe("formatApproximateDose", () => {
  test("uses integers when exact", () => {
    expect(formatApproximateDose(10)).toBe("10 mg");
  });

  test("uses one decimal place otherwise", () => {
    expect(formatApproximateDose(2.5)).toBe("2.5 mg");
  });

  test("avoids displaying 0 mg for tiny positive values", () => {
    expect(formatApproximateDose(0.02)).toBe("< 0.1 mg");
  });
});
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { DailyCheckInForm } from "@/components/forms/daily-checkin-form";

vi.mock("@/lib/actions/logs", () => ({
  saveDailyCheckInAction: vi.fn(async () => ({ status: "idle" })),
}));

vi.mock("@/components/dose/approximate-dose-reference-tool", () => ({
  ApproximateDoseReferenceTool: () => <div data-testid="dose-reference-tool" />,
}));

describe("DailyCheckInForm presets", () => {
  test("clicking a preset visibly updates the scores", async () => {
    const user = userEvent.setup();

    render(
      <DailyCheckInForm
        profileDose={1}
        profileMedication="Lorazepam"
        initialDate="2026-04-07"
        initialLog={null}
        logs={[]}
        today="2026-04-07"
        isFirstLog
        hasMedicationDetails={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Calm" }));

    expect(screen.getByRole("button", { name: "Calm" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Anxiety score")).toHaveValue(2);
    expect(screen.getByLabelText("Mood score")).toHaveValue(7);
    expect(screen.getByLabelText("Sleep quality score")).toHaveValue(7);
    expect(
      screen.getByText(/Calm selected\. Anxiety, mood, and sleep quality were updated below\./i),
    ).toBeInTheDocument();
  });

  test("preset buttons remain keyboard accessible", async () => {
    const user = userEvent.setup();

    render(
      <DailyCheckInForm
        profileDose={1}
        profileMedication="Lorazepam"
        initialDate="2026-04-07"
        initialLog={null}
        logs={[]}
        today="2026-04-07"
        isFirstLog
        hasMedicationDetails={false}
      />,
    );

    const calmButton = screen.getByRole("button", { name: "Calm" });
    calmButton.focus();
    await user.keyboard("[Space]");

    expect(calmButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Anxiety score")).toHaveValue(2);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { ApproximateDoseReferenceTool } from "@/components/dose/approximate-dose-reference-tool";

describe("ApproximateDoseReferenceTool", () => {
  test("shows estimate and warnings together", async () => {
    const user = userEvent.setup();

    render(
      <ApproximateDoseReferenceTool
        defaultMedication="Alprazolam"
        defaultDose={0.5}
      />,
    );

    await user.click(screen.getByRole("button", { name: /check approximate equivalence/i }));

    expect(screen.getByText(/roughly similar to 10 mg of diazepam/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Approximate only\. Different sources use slightly different estimates\./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Do not use this alone to change your medication\./i),
    ).toBeInTheDocument();
  });

  test("shows fallback for unlisted medication", async () => {
    const user = userEvent.setup();

    render(
      <ApproximateDoseReferenceTool
        defaultMedication="Other / not listed"
        defaultDose={1}
      />,
    );

    await user.click(screen.getByRole("button", { name: /check approximate equivalence/i }));

    expect(
      screen.getByText(/An approximate reference is not available for this medication\./i),
    ).toBeInTheDocument();
  });
});
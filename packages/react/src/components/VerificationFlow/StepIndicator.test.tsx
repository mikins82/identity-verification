import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StepIndicator } from "./StepIndicator";

describe("StepIndicator", () => {
  it("renders all three step labels", () => {
    render(<StepIndicator currentStep="selfie" />);

    expect(screen.getByText("Selfie")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
  });

  it("renders a navigation landmark", () => {
    render(<StepIndicator currentStep="selfie" />);
    expect(screen.getByRole("navigation", { name: "Verification progress" })).toBeInTheDocument();
  });

  it("renders an ordered list", () => {
    render(<StepIndicator currentStep="selfie" />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("marks the current step with aria-current", () => {
    const { container } = render(<StepIndicator currentStep="phone" />);

    const activeBadge = container.querySelector("[aria-current='step']");
    expect(activeBadge).toBeInTheDocument();

    const activeBadges = container.querySelectorAll("[aria-current='step']");
    expect(activeBadges).toHaveLength(1);
  });

  it("shows the active style on the current step badge", () => {
    const { container } = render(<StepIndicator currentStep="selfie" />);

    const activeBadge = container.querySelector("[aria-current='step']");
    expect(activeBadge).toHaveClass("badgeActive");
  });

  it("shows completed styling for steps before the current step", () => {
    const { container } = render(<StepIndicator currentStep="address" />);

    const completedBadges = container.querySelectorAll(".badgeCompleted");
    expect(completedBadges).toHaveLength(2);
  });

  it("shows a check icon for completed steps", () => {
    const { container } = render(<StepIndicator currentStep="address" />);

    const checkIcons = container.querySelectorAll(".checkIcon");
    expect(checkIcons).toHaveLength(2);
  });

  it("shows step numbers for non-completed steps", () => {
    render(<StepIndicator currentStep="selfie" />);

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows check for completed and number for future steps", () => {
    const { container } = render(<StepIndicator currentStep="phone" />);

    const checkIcons = container.querySelectorAll(".checkIcon");
    expect(checkIcons).toHaveLength(1);

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("marks all steps completed when in 'verifying' state", () => {
    const { container } = render(<StepIndicator currentStep="verifying" />);

    const completedBadges = container.querySelectorAll(".badgeCompleted");
    expect(completedBadges).toHaveLength(3);

    const checkIcons = container.querySelectorAll(".checkIcon");
    expect(checkIcons).toHaveLength(3);
  });

  it("marks all steps completed when in 'complete' state", () => {
    const { container } = render(<StepIndicator currentStep="complete" />);

    const completedBadges = container.querySelectorAll(".badgeCompleted");
    expect(completedBadges).toHaveLength(3);
  });

  it("marks all steps completed when in 'failed' state", () => {
    const { container } = render(<StepIndicator currentStep="failed" />);

    const completedBadges = container.querySelectorAll(".badgeCompleted");
    expect(completedBadges).toHaveLength(3);
  });

  it("renders labels below each step circle", () => {
    const { container } = render(<StepIndicator currentStep="selfie" />);

    const stepCircles = container.querySelectorAll(".stepCircle");
    expect(stepCircles).toHaveLength(3);
  });

  it("does not render connector lines between steps", () => {
    const { container } = render(<StepIndicator currentStep="selfie" />);

    const connectors = container.querySelectorAll(".connector");
    expect(connectors).toHaveLength(0);
  });

  it("applies custom className", () => {
    render(<StepIndicator currentStep="selfie" className="my-custom" />);

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("my-custom");
  });

  it("applies active label styling to the current step", () => {
    const { container } = render(<StepIndicator currentStep="phone" />);

    const activeLabels = container.querySelectorAll(".labelActive");
    expect(activeLabels).toHaveLength(1);
    expect(activeLabels[0]).toHaveTextContent("Phone");
  });

  it("applies completed label styling to past steps", () => {
    const { container } = render(<StepIndicator currentStep="address" />);

    const completedLabels = container.querySelectorAll(".labelCompleted");
    expect(completedLabels).toHaveLength(2);
  });
});

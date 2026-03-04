import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FaceGuideOverlay } from "./FaceGuideOverlay";

describe("FaceGuideOverlay", () => {
  it("renders an SVG element", () => {
    const { container } = render(<FaceGuideOverlay />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("is hidden from assistive technology", () => {
    const { container } = render(<FaceGuideOverlay />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders an ellipse for the default oval shape", () => {
    const { container } = render(<FaceGuideOverlay />);
    const ellipses = container.querySelectorAll("ellipse");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll("mask rect[rx]")).toHaveLength(0);
  });

  it("renders an ellipse when shape is explicitly 'oval'", () => {
    const { container } = render(<FaceGuideOverlay shape="oval" />);
    const ellipses = container.querySelectorAll("ellipse");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it("renders rounded rectangles for rectangle shape", () => {
    const { container } = render(<FaceGuideOverlay shape="rectangle" />);
    expect(container.querySelectorAll("ellipse")).toHaveLength(0);
    const rects = container.querySelectorAll("rect[rx]");
    expect(rects.length).toBeGreaterThanOrEqual(1);
  });

  it("uses pointer-events: none so it does not block clicks", () => {
    const { container } = render(<FaceGuideOverlay />);
    const svg = container.querySelector("svg")!;
    expect(svg.style.pointerEvents).toBe("none");
  });

  it("has an absolute position to overlay the camera feed", () => {
    const { container } = render(<FaceGuideOverlay />);
    const svg = container.querySelector("svg")!;
    expect(svg.style.position).toBe("absolute");
  });

  it("contains a mask element for the cutout effect", () => {
    const { container } = render(<FaceGuideOverlay />);
    expect(container.querySelector("mask")).toBeInTheDocument();
  });

  it("renders a dashed stroke guide for oval shape", () => {
    const { container } = render(<FaceGuideOverlay shape="oval" />);
    const strokedEllipse = container.querySelector("ellipse[stroke-dasharray]");
    expect(strokedEllipse).toBeInTheDocument();
    expect(strokedEllipse).toHaveAttribute("stroke", "white");
  });

  it("renders a dashed stroke guide for rectangle shape", () => {
    const { container } = render(<FaceGuideOverlay shape="rectangle" />);
    const strokedRect = container.querySelector("rect[stroke-dasharray]");
    expect(strokedRect).toBeInTheDocument();
    expect(strokedRect).toHaveAttribute("stroke", "white");
  });
});

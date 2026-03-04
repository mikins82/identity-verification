import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeProvider } from "./ThemeProvider";

describe("ThemeProvider", () => {
  it("applies CSS custom properties to wrapper div", () => {
    render(
      <ThemeProvider>
        <span data-testid="child">Hello</span>
      </ThemeProvider>,
    );

    const wrapper = screen.getByTestId("child").parentElement!;
    expect(wrapper.style.getPropertyValue("--iv-color-primary")).toBe("#0066ff");
    expect(wrapper.style.getPropertyValue("--iv-border-radius")).toBe("8px");
    expect(wrapper.style.getPropertyValue("--iv-spacing-md")).toBe("16px");
    expect(wrapper.style.getPropertyValue("--iv-font-family")).toBe(
      "system-ui, -apple-system, sans-serif",
    );
  });

  it("overrides specific theme values while keeping defaults", () => {
    render(
      <ThemeProvider theme={{ colors: { primary: "#7c3aed" } as never }}>
        <span data-testid="child">Hello</span>
      </ThemeProvider>,
    );

    const wrapper = screen.getByTestId("child").parentElement!;
    expect(wrapper.style.getPropertyValue("--iv-color-primary")).toBe("#7c3aed");
    expect(wrapper.style.getPropertyValue("--iv-color-error")).toBe("#dc2626");
  });

  it("overrides borderRadius and fontFamily", () => {
    render(
      <ThemeProvider theme={{ borderRadius: "12px", fontFamily: "Inter, sans-serif" }}>
        <span data-testid="child">Hello</span>
      </ThemeProvider>,
    );

    const wrapper = screen.getByTestId("child").parentElement!;
    expect(wrapper.style.getPropertyValue("--iv-border-radius")).toBe("12px");
    expect(wrapper.style.getPropertyValue("--iv-font-family")).toBe("Inter, sans-serif");
  });

  it("renders children correctly", () => {
    render(
      <ThemeProvider>
        <button>Click me</button>
      </ThemeProvider>,
    );

    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("handles nested ThemeProviders where inner overrides outer", () => {
    render(
      <ThemeProvider theme={{ colors: { primary: "#ff0000" } as never }}>
        <ThemeProvider theme={{ colors: { primary: "#00ff00" } as never }}>
          <span data-testid="inner-child">Hello</span>
        </ThemeProvider>
      </ThemeProvider>,
    );

    const innerWrapper = screen.getByTestId("inner-child").parentElement!;
    expect(innerWrapper.style.getPropertyValue("--iv-color-primary")).toBe("#00ff00");
  });

  it("uses default theme when no theme prop is provided", () => {
    render(
      <ThemeProvider>
        <span data-testid="child">Hello</span>
      </ThemeProvider>,
    );

    const wrapper = screen.getByTestId("child").parentElement!;
    expect(wrapper.style.getPropertyValue("--iv-color-success")).toBe("#16a34a");
    expect(wrapper.style.getPropertyValue("--iv-spacing-xs")).toBe("4px");
    expect(wrapper.style.getPropertyValue("--iv-spacing-xl")).toBe("32px");
  });
});

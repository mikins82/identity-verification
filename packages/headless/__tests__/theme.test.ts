import { describe, it, expect } from "vitest";
import { themeToCustomProperties } from "../src/theme/themeToCustomProperties";
import { defaultTheme } from "../src/theme/defaultTheme";
import type { Theme } from "../src/theme/theme.types";

describe("defaultTheme", () => {
  it("has all required color keys", () => {
    const expectedKeys = [
      "primary",
      "primaryHover",
      "error",
      "errorLight",
      "success",
      "successLight",
      "text",
      "textSecondary",
      "background",
      "surface",
      "border",
    ];
    expect(Object.keys(defaultTheme.colors)).toEqual(expect.arrayContaining(expectedKeys));
    expect(Object.keys(defaultTheme.colors)).toHaveLength(expectedKeys.length);
  });

  it("has all required spacing keys", () => {
    const expectedKeys = ["xs", "sm", "md", "lg", "xl"];
    expect(Object.keys(defaultTheme.spacing)).toEqual(expect.arrayContaining(expectedKeys));
    expect(Object.keys(defaultTheme.spacing)).toHaveLength(expectedKeys.length);
  });

  it("has borderRadius and fontFamily", () => {
    expect(defaultTheme.borderRadius).toBe("8px");
    expect(defaultTheme.fontFamily).toContain("system-ui");
  });

  it("uses valid CSS color values", () => {
    for (const value of Object.values(defaultTheme.colors)) {
      expect(value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("uses px values for spacing", () => {
    for (const value of Object.values(defaultTheme.spacing)) {
      expect(value).toMatch(/^\d+px$/);
    }
  });
});

describe("themeToCustomProperties", () => {
  it("converts color keys to kebab-case CSS custom properties", () => {
    const vars = themeToCustomProperties(defaultTheme);

    expect(vars["--iv-color-primary"]).toBe("#0066ff");
    expect(vars["--iv-color-primary-hover"]).toBe("#0052cc");
    expect(vars["--iv-color-error"]).toBe("#dc2626");
    expect(vars["--iv-color-error-light"]).toBe("#fef2f2");
    expect(vars["--iv-color-success"]).toBe("#16a34a");
    expect(vars["--iv-color-success-light"]).toBe("#f0fdf4");
    expect(vars["--iv-color-text"]).toBe("#111827");
    expect(vars["--iv-color-text-secondary"]).toBe("#6b7280");
    expect(vars["--iv-color-background"]).toBe("#ffffff");
    expect(vars["--iv-color-surface"]).toBe("#f9fafb");
    expect(vars["--iv-color-border"]).toBe("#e5e7eb");
  });

  it("includes borderRadius and fontFamily", () => {
    const vars = themeToCustomProperties(defaultTheme);

    expect(vars["--iv-border-radius"]).toBe("8px");
    expect(vars["--iv-font-family"]).toBe("system-ui, -apple-system, sans-serif");
  });

  it("converts spacing keys to CSS custom properties", () => {
    const vars = themeToCustomProperties(defaultTheme);

    expect(vars["--iv-spacing-xs"]).toBe("4px");
    expect(vars["--iv-spacing-sm"]).toBe("8px");
    expect(vars["--iv-spacing-md"]).toBe("16px");
    expect(vars["--iv-spacing-lg"]).toBe("24px");
    expect(vars["--iv-spacing-xl"]).toBe("32px");
  });

  it("produces the correct total number of properties", () => {
    const vars = themeToCustomProperties(defaultTheme);
    const colorCount = Object.keys(defaultTheme.colors).length;
    const spacingCount = Object.keys(defaultTheme.spacing).length;
    const extraCount = 2; // borderRadius + fontFamily
    expect(Object.keys(vars)).toHaveLength(colorCount + spacingCount + extraCount);
  });

  it("works with a custom theme", () => {
    const custom: Theme = {
      colors: {
        primary: "#ff0000",
        primaryHover: "#cc0000",
        error: "#ff4444",
        errorLight: "#ffe0e0",
        success: "#00ff00",
        successLight: "#e0ffe0",
        text: "#000000",
        textSecondary: "#666666",
        background: "#fafafa",
        surface: "#f0f0f0",
        border: "#cccccc",
      },
      borderRadius: "4px",
      fontFamily: "Arial, sans-serif",
      spacing: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "16px",
        xl: "24px",
      },
    };

    const vars = themeToCustomProperties(custom);

    expect(vars["--iv-color-primary"]).toBe("#ff0000");
    expect(vars["--iv-border-radius"]).toBe("4px");
    expect(vars["--iv-font-family"]).toBe("Arial, sans-serif");
    expect(vars["--iv-spacing-md"]).toBe("8px");
  });

  it("converts camelCase color keys to kebab-case correctly", () => {
    const vars = themeToCustomProperties(defaultTheme);

    const keys = Object.keys(vars);
    for (const key of keys) {
      expect(key).toMatch(/^--iv-[a-z-]+$/);
      expect(key).not.toMatch(/[A-Z]/);
    }
  });
});

import type { Theme } from "./theme.types";

export const defaultTheme: Theme = {
  colors: {
    primary: "#0066ff",
    primaryHover: "#0052cc",
    error: "#dc2626",
    errorLight: "#fef2f2",
    success: "#16a34a",
    successLight: "#f0fdf4",
    text: "#111827",
    textSecondary: "#6b7280",
    background: "#ffffff",
    surface: "#f9fafb",
    border: "#e5e7eb",
  },
  borderRadius: "8px",
  fontFamily: "system-ui, -apple-system, sans-serif",
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
};

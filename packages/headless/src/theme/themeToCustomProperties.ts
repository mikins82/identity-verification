import type { Theme } from "./theme.types";

function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

export function themeToCustomProperties(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [key, value] of Object.entries(theme.colors)) {
    vars[`--iv-color-${camelToKebab(key)}`] = value;
  }

  vars["--iv-border-radius"] = theme.borderRadius;
  vars["--iv-font-family"] = theme.fontFamily;

  for (const [key, value] of Object.entries(theme.spacing)) {
    vars[`--iv-spacing-${key}`] = value;
  }

  return vars;
}

import { type ReactNode, useMemo } from "react";
import { defaultTheme, type Theme } from "@identity-verification/headless";
import { ThemeContext } from "./ThemeContext";

export interface ThemeProviderProps {
  theme?: Partial<Theme>;
  children: ReactNode;
}

function mergeTheme(base: Theme, override: Partial<Theme>): Theme {
  return {
    colors: { ...base.colors, ...override.colors },
    spacing: { ...base.spacing, ...override.spacing },
    borderRadius: override.borderRadius ?? base.borderRadius,
    fontFamily: override.fontFamily ?? base.fontFamily,
  };
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const merged = useMemo(
    () => mergeTheme(defaultTheme, theme ?? {}),
    [theme],
  );

  return (
    <ThemeContext.Provider value={merged}>{children}</ThemeContext.Provider>
  );
}

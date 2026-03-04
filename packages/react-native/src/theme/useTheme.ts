import { useContext, useMemo } from "react";
import type { Theme, ThemeSpacing } from "@identity-verification/headless";
import { ThemeContext } from "./ThemeContext";

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

function stripPx(value: string): number {
  const num = parseFloat(value);
  return Number.isNaN(num) ? 0 : num;
}

export type NumericSpacing = Record<keyof ThemeSpacing, number>;

export function useNumericSpacing(): NumericSpacing {
  const theme = useTheme();
  return useMemo(
    () => ({
      xs: stripPx(theme.spacing.xs),
      sm: stripPx(theme.spacing.sm),
      md: stripPx(theme.spacing.md),
      lg: stripPx(theme.spacing.lg),
      xl: stripPx(theme.spacing.xl),
    }),
    [theme.spacing],
  );
}

export function useBorderRadius(): number {
  const theme = useTheme();
  return useMemo(() => stripPx(theme.borderRadius), [theme.borderRadius]);
}

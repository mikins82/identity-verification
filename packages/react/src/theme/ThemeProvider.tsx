import { type ReactNode, useMemo } from "react";
import {
  defaultTheme,
  themeToCustomProperties,
  type Theme,
  type ThemeColors,
  type ThemeSpacing,
} from "@identity-verification/headless";

export type PartialTheme = {
  colors?: Partial<ThemeColors>;
  spacing?: Partial<ThemeSpacing>;
  borderRadius?: string;
  fontFamily?: string;
};

export interface ThemeProviderProps {
  theme?: PartialTheme;
  children: ReactNode;
}

function mergeTheme(base: Theme, override: PartialTheme): Theme {
  return {
    colors: { ...base.colors, ...override.colors },
    spacing: { ...base.spacing, ...override.spacing },
    borderRadius: override.borderRadius ?? base.borderRadius,
    fontFamily: override.fontFamily ?? base.fontFamily,
  };
}

export function ThemeProvider({ theme, children }: ThemeProviderProps): React.JSX.Element {
  const cssVars = useMemo(() => {
    const merged = mergeTheme(defaultTheme, theme ?? {});
    return themeToCustomProperties(merged);
  }, [theme]);

  return <div style={cssVars}>{children}</div>;
}

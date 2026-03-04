import { type ReactNode, useMemo } from "react";
import { defaultTheme } from "./defaultTheme";
import { themeToCustomProperties } from "./themeToCustomProperties";
import type { Theme } from "./theme.types";

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

export function ThemeProvider({ theme, children }: ThemeProviderProps): React.JSX.Element {
  const cssVars = useMemo(() => {
    const merged = mergeTheme(defaultTheme, theme ?? {});
    return themeToCustomProperties(merged);
  }, [theme]);

  return <div style={cssVars}>{children}</div>;
}

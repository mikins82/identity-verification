import { createContext } from "react";
import { defaultTheme, type Theme } from "@identity-verification/headless";

export const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  text: string;
  textSecondary: string;
  background: string;
  surface: string;
  border: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface Theme {
  colors: ThemeColors;
  borderRadius: string;
  fontFamily: string;
  spacing: ThemeSpacing;
}

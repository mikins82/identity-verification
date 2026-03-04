export { SelfieCapture } from "./components/SelfieCapture";
export type { SelfieCaptureProps } from "./components/SelfieCapture";

export { PhoneInput } from "./components/PhoneInput";
export type { PhoneInputProps } from "./components/PhoneInput";

export { AddressForm } from "./components/AddressForm";
export type { AddressFormProps } from "./components/AddressForm";

export { VerificationFlow } from "./components/VerificationFlow";
export type { VerificationFlowProps } from "./components/VerificationFlow";
export { StepIndicator } from "./components/VerificationFlow";
export type {
  StepIndicatorProps,
  VerificationStep,
  VerificationState,
  VerificationAction,
} from "./components/VerificationFlow";

export { FormField } from "./components/shared/FormField";
export type { FormFieldProps } from "./components/shared/FormField";

export { Dropdown } from "./components/shared/Dropdown";
export type { DropdownProps } from "./components/shared/Dropdown";

export { ThemeProvider } from "./theme/ThemeProvider";
export type { ThemeProviderProps } from "./theme/ThemeProvider";
export type { Theme, ThemeColors, ThemeSpacing } from "./theme/theme.types";
export { defaultTheme } from "./theme/defaultTheme";

export { useCamera } from "./hooks/useCamera";
export type { CameraState, CameraError } from "./hooks/useCamera";
export { useMediaPermission } from "./hooks/useMediaPermission";
export type { PermissionState } from "./hooks/useMediaPermission";

export type {
  Address,
  IdentityData,
  VerificationInput,
  ValidationResult,
  ValidationError,
  CountryCode,
  VerificationOptions,
} from "@identity-verification/core";

export { SelfieCapture } from "./components/SelfieCapture";
export type { SelfieCaptureProps } from "./components/SelfieCapture";

export { PhoneInput } from "./components/PhoneInput";
export type { PhoneInputProps } from "./components/PhoneInput";

export { AddressForm } from "./components/AddressForm";
export type { AddressFormProps } from "./components/AddressForm";

export { VerificationFlow } from "./components/VerificationFlow";
export type { VerificationFlowProps } from "./components/VerificationFlow";
export { StepIndicator } from "./components/VerificationFlow";
export type { StepIndicatorProps } from "./components/VerificationFlow";

export { FormField } from "./components/shared/FormField";
export type { FormFieldProps } from "./components/shared/FormField";

export { Picker } from "./components/shared/Picker";
export type { PickerProps } from "./components/shared/Picker";

export { ThemeProvider } from "./theme/ThemeProvider";
export type { ThemeProviderProps } from "./theme/ThemeProvider";

export { useTheme, useNumericSpacing, useBorderRadius } from "./theme/useTheme";
export type { NumericSpacing } from "./theme/useTheme";

export { useCamera } from "./hooks/useCamera";
export { useMediaPermission } from "./hooks/useMediaPermission";

export {
  ReactNativeCameraAdapter,
  ReactNativePermissionAdapter,
  ReactNativeLocaleAdapter,
  createReactNativeAdapters,
  capturePhoto,
} from "@identity-verification/headless/react-native";

export {
  defaultTheme,
  CameraController,
  verificationReducer,
  initialVerificationState,
  canAdvance,
  STEP_ORDER,
} from "@identity-verification/headless";

export type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  CameraState,
  CameraError,
  CameraOptions,
  CameraAdapter,
  CameraStreamOptions,
  PermissionState,
  PermissionAdapter,
  LocaleAdapter,
  VerificationState,
  VerificationAction,
  VerificationStep,
} from "@identity-verification/headless";

export type {
  Address,
  IdentityData,
  VerificationInput,
  ValidationResult,
  ValidationError,
  CountryCode,
  VerificationOptions,
} from "@identity-verification/core";

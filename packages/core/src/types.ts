export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface IdentityData {
  selfieUrl: string;
  /** E.164 format with '+' prefix, e.g. '+14155552671' */
  phone: string;
  address: Address;
  score: number;
  status: "verified" | "failed";
}

export interface VerificationInput {
  /** base64 data URL from SelfieCapture */
  selfie: string;
  /** Raw digits as entered by user (normalization happens inside getIdentityData) */
  phone: string;
  /** ISO 3166-1 alpha-2, e.g. 'US' */
  countryCode: string;
  address: Address;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  /** Machine-readable: 'REQUIRED', 'INVALID_FORMAT', 'TOO_SHORT', etc. */
  code: string;
  message: string;
}

export interface CountryCode {
  /** ISO 3166-1 alpha-2: 'US', 'GB', 'MX' */
  code: string;
  name: string;
  /** e.g. '+1' */
  dialCode: string;
  /** Emoji flag */
  flag: string;
  /** Exact digit count or [min, max] range (digits only, excluding dial code) */
  phoneLength: number | [number, number];
  postalRegex?: RegExp;
}

export interface VerificationOptions {
  /** Simulated API latency in ms. Default 1500, set 0 for instant (tests). */
  simulatedLatencyMs?: number;
  /** Deterministic scoring for tests */
  seed?: number;
}

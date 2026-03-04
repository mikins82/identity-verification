export type {
  Address,
  IdentityData,
  VerificationInput,
  ValidationResult,
  ValidationError,
  CountryCode,
  VerificationOptions,
} from "./types";

export { VerificationError } from "./errors";
export type { VerificationErrorCode } from "./errors";

export { COUNTRIES, findCountryByCode, findCountriesByDialCode } from "./countries";

export { validatePhone, normalizeToE164, validateAddress } from "./validation";

export { generateVerificationScore } from "./scoring";

export { getIdentityData } from "./identity";

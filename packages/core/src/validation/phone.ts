import type { ValidationResult, ValidationError } from "../types";
import { findCountryByCode } from "../countries";
import { required, exactLength, lengthInRange } from "./rules";

function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Detects if the input already starts with the country's dial code
 * and strips it to avoid double-prefixing.
 */
function stripDialPrefix(digits: string, dialCode: string): string {
  const dialDigits = stripNonDigits(dialCode);
  if (digits.startsWith(dialDigits)) {
    return digits.slice(dialDigits.length);
  }
  return digits;
}

/**
 * Some countries (e.g. UK) use a leading zero in local numbers
 * that must be stripped before prepending the dial code.
 */
function stripLeadingZero(digits: string): string {
  if (digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

export function validatePhone(
  phone: string,
  countryCode: string,
): ValidationResult {
  const errors: ValidationError[] = [];

  const requiredErr = required(phone, "phone");
  if (requiredErr) {
    return { valid: false, errors: [requiredErr] };
  }

  const country = findCountryByCode(countryCode);
  if (!country) {
    return {
      valid: false,
      errors: [
        {
          field: "phone",
          code: "UNKNOWN_COUNTRY",
          message: `Unknown country code: ${countryCode}`,
        },
      ],
    };
  }

  let digits = stripNonDigits(phone);

  if (digits.length === 0) {
    return {
      valid: false,
      errors: [
        {
          field: "phone",
          code: "INVALID_FORMAT",
          message: "Phone number must contain digits",
        },
      ],
    };
  }

  digits = stripDialPrefix(digits, country.dialCode);
  digits = stripLeadingZero(digits);

  const { phoneLength } = country;
  if (Array.isArray(phoneLength)) {
    const lengthErr = lengthInRange(
      digits,
      phoneLength[0],
      phoneLength[1],
      "phone",
    );
    if (lengthErr) {
      errors.push(lengthErr);
    }
  } else {
    const lengthErr = exactLength(digits, phoneLength, "phone");
    if (lengthErr) {
      errors.push(lengthErr);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Normalizes a phone number to E.164 format.
 * Always returns a string starting with '+'.
 *
 * @example
 * normalizeToE164('(415) 555-2671', 'US') // '+14155552671'
 * normalizeToE164('07911123456', 'GB')     // '+447911123456'
 */
export function normalizeToE164(phone: string, countryCode: string): string {
  const country = findCountryByCode(countryCode);
  if (!country) {
    const digits = stripNonDigits(phone);
    return `+${digits}`;
  }

  let digits = stripNonDigits(phone);
  digits = stripDialPrefix(digits, country.dialCode);
  digits = stripLeadingZero(digits);

  const dialDigits = stripNonDigits(country.dialCode);
  return `+${dialDigits}${digits}`;
}

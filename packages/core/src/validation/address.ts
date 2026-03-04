import type { Address, ValidationResult, ValidationError } from "../types";
import { findCountryByCode } from "../countries";
import { required, minLength, matchesPattern } from "./rules";

export function validateAddress(
  address: Partial<Address>,
  countryCode?: string,
): ValidationResult {
  const errors: ValidationError[] = [];

  const streetRequired = required(address.street ?? "", "street");
  if (streetRequired) {
    errors.push(streetRequired);
  } else {
    const streetLength = minLength(address.street ?? "", 3, "street");
    if (streetLength) {
      errors.push(streetLength);
    }
  }

  const cityRequired = required(address.city ?? "", "city");
  if (cityRequired) {
    errors.push(cityRequired);
  }

  const stateRequired = required(address.state ?? "", "state");
  if (stateRequired) {
    errors.push(stateRequired);
  }

  const countryRequired = required(address.country ?? "", "country");
  if (countryRequired) {
    errors.push(countryRequired);
  }

  const postalRequired = required(address.postalCode ?? "", "postalCode");
  if (postalRequired) {
    errors.push(postalRequired);
  } else if (countryCode) {
    const country = findCountryByCode(countryCode);
    if (country?.postalRegex) {
      const postalErr = matchesPattern(
        address.postalCode!,
        country.postalRegex,
        "postalCode",
        "INVALID_FORMAT",
        `Invalid postal code format for ${country.name}`,
      );
      if (postalErr) {
        errors.push(postalErr);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

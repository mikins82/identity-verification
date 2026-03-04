import type { ValidationError } from "../types";

export function required(
  value: string,
  field: string,
): ValidationError | null {
  if (!value || value.trim().length === 0) {
    return { field, code: "REQUIRED", message: `${field} is required` };
  }
  return null;
}

export function minLength(
  value: string,
  min: number,
  field: string,
): ValidationError | null {
  if (value.trim().length < min) {
    return {
      field,
      code: "TOO_SHORT",
      message: `${field} must be at least ${min} characters`,
    };
  }
  return null;
}

export function matchesPattern(
  value: string,
  regex: RegExp,
  field: string,
  code: string,
  message: string,
): ValidationError | null {
  if (!regex.test(value)) {
    return { field, code, message };
  }
  return null;
}

export function exactLength(
  value: string,
  length: number,
  field: string,
): ValidationError | null {
  if (value.length !== length) {
    return {
      field,
      code: "INVALID_LENGTH",
      message: `${field} must be exactly ${length} digits`,
    };
  }
  return null;
}

export function lengthInRange(
  value: string,
  min: number,
  max: number,
  field: string,
): ValidationError | null {
  if (value.length < min || value.length > max) {
    return {
      field,
      code: "INVALID_LENGTH",
      message: `${field} must be between ${min} and ${max} digits`,
    };
  }
  return null;
}

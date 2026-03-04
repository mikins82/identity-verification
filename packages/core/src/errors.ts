import type { ValidationError } from "./types";

export type VerificationErrorCode =
  | "VALIDATION_FAILED"
  | "SELFIE_MISSING"
  | "PHONE_INVALID"
  | "ADDRESS_INCOMPLETE";

export class VerificationError extends Error {
  public readonly code: VerificationErrorCode;
  public readonly details?: ValidationError[];

  constructor(
    message: string,
    code: VerificationErrorCode,
    details?: ValidationError[],
  ) {
    super(message);
    this.name = "VerificationError";
    this.code = code;
    this.details = details;
  }
}

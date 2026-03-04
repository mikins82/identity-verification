import type { IdentityData, VerificationInput, VerificationOptions } from "./types";
import { VerificationError } from "./errors";
import { validatePhone, normalizeToE164 } from "./validation/phone";
import { validateAddress } from "./validation/address";
import { generateVerificationScore } from "./scoring";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Orchestrates identity verification: validates all inputs, simulates API latency,
 * generates a randomized score, and returns the final IdentityData.
 *
 * @throws {VerificationError} if selfie, phone, or address inputs are invalid
 */
export async function getIdentityData(
  input: VerificationInput,
  options: VerificationOptions = {},
): Promise<IdentityData> {
  if (!input.selfie || input.selfie.trim().length === 0) {
    throw new VerificationError(
      "Selfie image is required",
      "SELFIE_MISSING",
    );
  }

  const phoneResult = validatePhone(input.phone, input.countryCode);
  if (!phoneResult.valid) {
    throw new VerificationError(
      "Phone number is invalid",
      "PHONE_INVALID",
      phoneResult.errors,
    );
  }

  const addressResult = validateAddress(input.address, input.countryCode);
  if (!addressResult.valid) {
    throw new VerificationError(
      "Address is incomplete or invalid",
      "ADDRESS_INCOMPLETE",
      addressResult.errors,
    );
  }

  const latency = options.simulatedLatencyMs ?? 1500;
  if (latency > 0) {
    await sleep(latency);
  }

  const score = generateVerificationScore(options.seed);
  const status: IdentityData["status"] = score >= 50 ? "verified" : "failed";

  return {
    selfieUrl: input.selfie,
    phone: normalizeToE164(input.phone, input.countryCode),
    address: input.address,
    score,
    status,
  };
}

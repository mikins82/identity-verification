# @identity-verification/core

Pure TypeScript identity verification SDK — types, validators, scoring, and country data. Zero runtime dependencies, runs in any JavaScript environment.

## Installation

```bash
pnpm add @identity-verification/core
```

## Quick Start

```typescript
import { getIdentityData } from '@identity-verification/core';

const result = await getIdentityData({
  selfie: 'data:image/jpeg;base64,...',
  phone: '4155552671',
  countryCode: 'US',
  address: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    postalCode: '94102',
  },
});
// → { selfieUrl, phone: '+14155552671', address, score: 85, status: 'verified' }
```

## API

### `getIdentityData(input, options?)`

Main orchestrator. Validates all input fields, simulates API latency, generates a verification score, and returns the final `IdentityData` object.

Throws `VerificationError` with a typed error code if input is invalid.

| Option              | Type     | Default | Description                           |
| ------------------- | -------- | ------- | ------------------------------------- |
| `simulatedLatencyMs`| `number` | `1500`  | Simulated API delay. Set `0` in tests.|
| `seed`              | `number` | —       | Deterministic scoring seed for tests. |

### `generateVerificationScore(seed?)`

Generates a score between 0 and 100 with a weighted distribution:
- **~30% chance** of failure (score 0–49)
- **~70% chance** of success (score 50–100)

Pass an optional `seed` for deterministic output in tests (uses Mulberry32 PRNG).

### `validatePhone(phone, countryCode)`

Returns `{ valid, errors }` for a phone number against country-specific rules (digit count, format). Handles dial-code stripping and leading-zero normalization.

### `validateAddress(address, countryCode?)`

Returns `{ valid, errors }` with per-field validation. When a `countryCode` is provided and the country has a `postalRegex`, the postal code is validated against it.

### `normalizeToE164(phone, countryCode)`

Converts a local phone number to E.164 international format.

```typescript
normalizeToE164('(415) 555-2671', 'US') // → '+14155552671'
normalizeToE164('07911123456', 'GB')     // → '+447911123456'
```

### `COUNTRIES`

Static dataset of ~20 countries with dial codes, flag emojis, phone length rules, and postal regex patterns.

### `findCountryByCode(code)` / `findCountriesByDialCode(dialCode)`

Helpers to look up country data by ISO 3166-1 alpha-2 code or dial code.

### `VerificationError`

Custom error class with a typed `code` property (`'SELFIE_MISSING' | 'PHONE_INVALID' | 'ADDRESS_INCOMPLETE' | 'VALIDATION_FAILED'`) and optional `details` array of per-field validation errors.

## Types

```typescript
import type {
  Address,
  IdentityData,
  VerificationInput,
  ValidationResult,
  ValidationError,
  CountryCode,
  VerificationOptions,
} from '@identity-verification/core';
```

## Development

```bash
pnpm build        # Build with tsup (ESM + CJS + .d.ts)
pnpm dev           # Watch mode
pnpm test:unit     # Run Vitest unit tests
pnpm test:watch    # Vitest in watch mode
pnpm lint          # ESLint
pnpm typecheck     # TypeScript type checking
```

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

// result: { selfieUrl, phone, address, score, status: 'verified' | 'failed' }
```

## API

### `getIdentityData(input, options?)`

Main orchestrator. Validates all input fields, generates a verification score, and returns identity data.

| Option              | Type     | Default | Description                           |
| ------------------- | -------- | ------- | ------------------------------------- |
| `simulatedLatencyMs`| `number` | `1500`  | Simulated API delay. Set `0` in tests.|
| `seed`              | `number` | —       | Deterministic scoring for tests.      |

### `validatePhone(phone, countryCode)`

Returns `{ valid, errors }` for a phone number against country-specific rules (length, format).

### `validateAddress(address, countryCode?)`

Returns `{ valid, errors }` with per-field validation including postal code regex matching.

### `normalizeToE164(phone, countryCode)`

Converts a local phone number to E.164 international format.

### `COUNTRIES`

Static dataset of ~20 countries with dial codes, flag emojis, phone length rules, and postal regex patterns.

### `findCountryByCode(code)` / `findCountriesByDialCode(dialCode)`

Helpers to look up country data.

### `generateVerificationScore(input)`

Produces a numeric verification score from the provided input.

### `VerificationError`

Custom error class with typed error codes (`VerificationErrorCode`).

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

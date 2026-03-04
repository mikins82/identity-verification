# @identity-verification/react

React components for identity verification — selfie capture, phone input, address form, and a full orchestrated verification flow.

## Installation

```bash
pnpm add @identity-verification/react
```

Peer dependencies: `react` >=18.0.0, `react-dom` >=18.0.0

Don't forget to import the stylesheet:

```typescript
import '@identity-verification/react/styles.css';
```

## Components

| Component          | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `VerificationFlow` | Full 3-step wizard (selfie → phone → address → verify)             |
| `SelfieCapture`    | Camera capture with face guide overlay                              |
| `PhoneInput`       | Phone input with country selector dropdown                          |
| `AddressForm`      | 5-field address form with country-driven postal validation          |
| `ThemeProvider`    | Applies a custom theme via CSS custom properties                    |
| `StepIndicator`    | Progress indicator for verification steps                           |
| `FormField`        | Shared labeled input field with error display                       |
| `Dropdown`         | Searchable dropdown used by PhoneInput and AddressForm              |

## Usage

### Orchestrated Flow

Drop in the full verification wizard with a single component:

```tsx
import { VerificationFlow, ThemeProvider } from '@identity-verification/react';
import '@identity-verification/react/styles.css';

function App() {
  return (
    <ThemeProvider theme={{ colors: { primary: '#7c3aed' } }}>
      <VerificationFlow
        onComplete={(result) => console.log(result)}
        onStepChange={(step) => console.log('Step:', step)}
        verificationOptions={{ simulatedLatencyMs: 1500 }}
      />
    </ThemeProvider>
  );
}
```

### Manual Composition

Use individual components for full control over layout and flow:

```tsx
import { SelfieCapture, PhoneInput, AddressForm } from '@identity-verification/react';
import { getIdentityData } from '@identity-verification/core';
import '@identity-verification/react/styles.css';

<SelfieCapture onCapture={(base64) => setSelfie(base64)} />
<PhoneInput onChange={(phone, country) => setPhone(phone)} />
<AddressForm onChange={(address) => setAddress(address)} />

const result = await getIdentityData({ selfie, phone, countryCode, address });
```

## Hooks

| Hook                | Description                                      |
| ------------------- | ------------------------------------------------ |
| `useCamera`         | Manages camera stream lifecycle and frame capture |
| `useMediaPermission`| Tracks and requests media permission status       |

## Theming

Components use CSS custom properties prefixed with `--iv-`. `ThemeProvider` is optional — all tokens have sensible defaults.

### Via ThemeProvider

```tsx
<ThemeProvider theme={{
  colors: { primary: '#7c3aed', primaryHover: '#6d28d9' },
  borderRadius: '12px',
}}>
  <VerificationFlow onComplete={handleResult} />
</ThemeProvider>
```

### Via CSS

```css
.my-wrapper {
  --iv-color-primary: #7c3aed;
  --iv-color-primary-hover: #6d28d9;
  --iv-border-radius: 12px;
}
```

See the [root README](../../README.md#available-tokens) for the full list of theme tokens.

## Re-exports

This package re-exports key items from `@identity-verification/headless` and `@identity-verification/core` for convenience — theme utilities, adapters, the verification reducer, and core types are all accessible directly.

## Development

```bash
pnpm build        # Build with Vite library mode (CSS Modules + ESM + CJS + .d.ts)
pnpm dev           # Watch mode
pnpm test:unit     # Run Vitest unit tests (React Testing Library)
pnpm test:watch    # Vitest in watch mode
pnpm lint          # ESLint
pnpm typecheck     # TypeScript type checking
```

# @identity-verification/react

React components for identity verification — selfie capture, phone input, address form, and a full orchestrated verification flow.

## Installation

```bash
pnpm add @identity-verification/react @identity-verification/core
```

Peer dependencies: `react` >=18.0.0, `react-dom` >=18.0.0

Import the stylesheet in your app entry point:

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
        onComplete={(result) => handleVerified(result)}
        onStepChange={(step) => trackAnalytics(step)}
        verificationOptions={{ simulatedLatencyMs: 1500 }}
      />
    </ThemeProvider>
  );
}
```

### Orchestrated Flow With `onResult`

When `onResult` is provided, the component hands control to the consumer after verification completes. Instead of showing its built-in complete/failed screens, it stays on the loading spinner while the consumer navigates away or renders its own result UI.

```tsx
<VerificationFlow
  onComplete={() => {}}
  onResult={(result) => {
    saveResult(result);
    navigate('/result');
  }}
/>
```

#### `VerificationFlow` Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `onComplete` | `(result: IdentityData) => void` | Yes | Called when verification succeeds. When `onResult` is **not** provided, the built-in success screen is shown afterward. |
| `onResult` | `(result: IdentityData) => void` | No | Called for **both** success and failure. When provided, the component stays on the loading spinner after verification and does not transition to built-in result screens — the consumer controls what happens next. |
| `onStepChange` | `(step: VerificationStep) => void` | No | Called when the active step changes (selfie, phone, address). |
| `onError` | `(error: Error) => void` | No | Called when verification throws an unexpected error. |
| `verificationOptions` | `VerificationOptions` | No | Passed through to `getIdentityData()`. Set `{ simulatedLatencyMs: 0 }` for tests. |
| `className` | `string` | No | Additional CSS class for the root container. |

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

## Bundle Size

The SDK uses `preserveModules` to ensure reliable tree-shaking. Importing a single component only pulls in the code for that component and its direct dependencies — no camera code leaks into `PhoneInput`, and no phone logic leaks into `SelfieCapture`.

| Import | Brotli | Gzip |
| --- | ---: | ---: |
| Full SDK (all exports) | ~7.5 kB | ~9.8 kB |
| `{ PhoneInput }` | ~2.7 kB | ~3.1 kB |
| `{ SelfieCapture }` | ~1.7 kB | ~2.0 kB |
| `{ AddressForm }` | ~2.7 kB | ~3.1 kB |
| CSS (`styles.css`) | ~2.4 kB | ~2.8 kB |

Sizes exclude peer dependencies (`react`, `react-dom`) and sibling packages (`@identity-verification/core`, `@identity-verification/headless`).

Bundle budgets are enforced via [size-limit](https://github.com/ai/size-limit) and a custom tree-shaking verification script. Run locally:

```bash
pnpm size          # Report current sizes
pnpm size:check    # Fail if any limit is exceeded
```

## Re-exports

This package re-exports key items from `@identity-verification/headless` and `@identity-verification/core` for convenience — theme utilities, browser adapters, the verification reducer, and core types are all accessible directly from `@identity-verification/react`.

## Development

```bash
pnpm build        # Build with Vite library mode (CSS Modules + ESM + CJS + .d.ts)
pnpm dev           # Watch mode
pnpm test:unit     # Run Vitest unit tests (React Testing Library)
pnpm test:watch    # Vitest in watch mode
pnpm lint          # ESLint
pnpm typecheck     # TypeScript type checking
pnpm size          # Check bundle sizes
```

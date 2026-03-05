# @identity-verification/react-native

> **Proof of concept** — This package demonstrates that the SDK architecture extends to React Native. It mirrors the web React SDK's API surface and shares the same headless layer, but has not been tested against a production React Native app. A companion demo app can be added in the future.

React Native components for identity verification — selfie capture, phone input, address form, and a complete verification flow.

## Installation

```bash
pnpm add @identity-verification/react-native
```

### Peer Dependencies

```bash
pnpm add react react-native react-native-vision-camera
```

`react-native-vision-camera` requires native linking. Follow the [vision-camera installation guide](https://react-native-vision-camera.com/docs/guides) for iOS and Android setup.

Optionally install `react-native-fs` for automatic base64 photo conversion:

```bash
pnpm add react-native-fs
```

## Quick Start — Orchestrated Flow

The `VerificationFlow` component provides the full selfie → phone → address → submit experience:

```tsx
import { VerificationFlow, ThemeProvider } from '@identity-verification/react-native';

function App() {
  return (
    <ThemeProvider>
      <VerificationFlow
        onComplete={(result) => console.log('Verified:', result)}
        onError={(error) => console.error(error)}
        onStepChange={(step) => console.log('Step:', step)}
      />
    </ThemeProvider>
  );
}
```

## Manual / Individual Components

Use components individually for custom flows:

```tsx
import {
  SelfieCapture,
  PhoneInput,
  AddressForm,
  ThemeProvider,
} from '@identity-verification/react-native';

function CustomFlow() {
  return (
    <ThemeProvider theme={{ colors: { primary: '#8b5cf6' } }}>
      <SelfieCapture onCapture={(base64) => handleSelfie(base64)} />
      <PhoneInput onChange={(phone, country) => handlePhone(phone, country)} />
      <AddressForm onChange={(address) => handleAddress(address)} />
    </ThemeProvider>
  );
}
```

## Theme Customization

The theme system uses React Context instead of CSS custom properties. Wrap your app with `ThemeProvider`:

```tsx
import { ThemeProvider } from '@identity-verification/react-native';

<ThemeProvider
  theme={{
    colors: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
    },
    borderRadius: '12px',
    spacing: { md: '20px' },
  }}
>
  {/* components */}
</ThemeProvider>
```

Access theme values in custom components:

```tsx
import { useTheme, useNumericSpacing, useBorderRadius } from '@identity-verification/react-native';

function MyComponent() {
  const theme = useTheme();
  const spacing = useNumericSpacing(); // { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
  const borderRadius = useBorderRadius(); // 8

  return <View style={{ padding: spacing.md, borderRadius }} />;
}
```

## Components

| Component          | Description                                        |
| ------------------ | -------------------------------------------------- |
| `VerificationFlow` | Full orchestrated flow (selfie → phone → address)  |
| `SelfieCapture`    | Camera viewfinder with face guide overlay           |
| `PhoneInput`       | Phone number input with country picker              |
| `AddressForm`      | Address form with country selector and validation   |
| `StepIndicator`    | Step progress indicator                             |
| `FormField`        | Form field wrapper with label, error, hint          |
| `Picker`           | Modal picker replacing web dropdown                 |
| `ThemeProvider`    | Context-based theme provider                        |

## Hooks

| Hook                 | Description                                     |
| -------------------- | ----------------------------------------------- |
| `useCamera`          | Vision camera integration (stream, capture)     |
| `useMediaPermission` | Camera permission state with AppState listener  |
| `useTheme`           | Access current theme from context               |
| `useNumericSpacing`  | Theme spacing with `px` stripped to numbers     |
| `useBorderRadius`    | Theme border radius as number                   |

## Architecture

```
@identity-verification/react-native
  └── @identity-verification/headless (state machines, adapters, theme types)
       └── @identity-verification/core (validation, API)
```

Platform-specific adapters are imported from `@identity-verification/headless/react-native`. The shared headless layer means validation, scoring, state machine logic, and theme types are identical between web and mobile.

## Development

```bash
pnpm build       # Build with tsup (ESM + CJS + .d.ts)
pnpm dev          # Watch mode
pnpm lint         # ESLint
pnpm typecheck    # TypeScript type checking
```

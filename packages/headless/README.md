# @identity-verification/headless

Headless identity verification SDK — state machines, platform adapters, and theme definitions. Framework-agnostic building blocks that power the React package (or any custom UI).

## Installation

```bash
pnpm add @identity-verification/headless
```

Peer dependency: `@identity-verification/core`

## Overview

This package sits between the pure-logic `core` and framework-specific UI packages. It provides:

- **Verification state machine** — a reducer-based state machine that drives the multi-step verification flow
- **Platform adapters** — abstractions for camera, permissions, and locale with browser implementations included
- **Theme system** — type-safe theme tokens and a utility to convert them to CSS custom properties

## API

### Verification Machine

```typescript
import { verificationReducer, initialVerificationState } from '@identity-verification/headless';

const nextState = verificationReducer(currentState, action);
```

Manages the verification flow state transitions (selfie capture, phone input, address entry, submission).

### Adapters

Abstract interfaces for platform capabilities, plus ready-to-use browser implementations available via the `./web` subpath.

```typescript
import {
  createBrowserAdapters,
  BrowserCameraAdapter,
  BrowserPermissionAdapter,
  BrowserLocaleAdapter,
} from '@identity-verification/headless/web';

const adapters = createBrowserAdapters();
```

| Adapter              | Purpose                              |
| -------------------- | ------------------------------------ |
| `CameraAdapter`      | Camera stream access and capture     |
| `PermissionAdapter`  | Media permission requests and status |
| `LocaleAdapter`      | Locale detection for defaults        |

### Camera Controller

```typescript
import { cameraController } from '@identity-verification/headless';
```

High-level camera control logic (start, stop, switch facing mode, capture frame).

### Theme

```typescript
import {
  defaultTheme,
  themeToCustomProperties,
} from '@identity-verification/headless';
import type { Theme, ThemeColors, ThemeSpacing } from '@identity-verification/headless';

const cssProps = themeToCustomProperties(myTheme);
// { '--iv-color-primary': '#0066ff', '--iv-border-radius': '8px', ... }
```

All CSS custom properties use the `--iv-` prefix and have built-in fallback values.

## Development

```bash
pnpm build        # Build with tsup (ESM + CJS + .d.ts)
pnpm dev           # Watch mode
pnpm test:unit     # Run Vitest unit tests
pnpm test:watch    # Vitest in watch mode
pnpm lint          # ESLint
pnpm typecheck     # TypeScript type checking
```

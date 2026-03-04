declare const require: (id: string) => unknown;

import { COUNTRIES } from "@identity-verification/core";
import type { LocaleAdapter } from "../locale";

interface PlatformModule {
  OS: string;
}

interface NativeModulesMap {
  SettingsManager?: { settings?: { AppleLocale?: string; AppleLanguages?: string[] } };
  I18nManager?: { localeIdentifier?: string };
}

let Platform: PlatformModule | undefined;
let NativeModules: NativeModulesMap | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const rn = require("react-native") as {
    Platform: PlatformModule;
    NativeModules: NativeModulesMap;
  };
  Platform = rn.Platform;
  NativeModules = rn.NativeModules;
} catch {
  /* optional dep */
}

function extractRegion(): string | undefined {
  if (!Platform || !NativeModules) return undefined;

  if (Platform.OS === "ios") {
    const settings = NativeModules.SettingsManager?.settings;
    const locale =
      settings?.AppleLocale ?? settings?.AppleLanguages?.[0];
    if (locale) {
      const region = locale.split(/[-_]/)[1]?.toUpperCase();
      if (region && COUNTRIES.some((c) => c.code === region)) return region;
    }
  }

  if (Platform.OS === "android") {
    const localeId = NativeModules.I18nManager?.localeIdentifier;
    if (localeId) {
      const region = localeId.split(/[-_]/)[1]?.toUpperCase();
      if (region && COUNTRIES.some((c) => c.code === region)) return region;
    }
  }

  return undefined;
}

export class ReactNativeLocaleAdapter implements LocaleAdapter {
  getDefaultCountryCode(): string {
    return extractRegion() ?? "US";
  }
}

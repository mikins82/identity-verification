import { COUNTRIES } from "@identity-verification/core";
import type { LocaleAdapter } from "../locale";

export class BrowserLocaleAdapter implements LocaleAdapter {
  getDefaultCountryCode(): string {
    if (typeof navigator === "undefined") return "US";
    const lang = navigator.language;
    const region = lang.split("-")[1]?.toUpperCase();
    if (region && COUNTRIES.some((c) => c.code === region)) return region;
    return "US";
  }
}

export { BrowserCameraAdapter } from "./browserCamera";
export { BrowserPermissionAdapter } from "./browserPermission";
export { BrowserLocaleAdapter } from "./browserLocale";

import { BrowserCameraAdapter } from "./browserCamera";
import { BrowserPermissionAdapter } from "./browserPermission";
import { BrowserLocaleAdapter } from "./browserLocale";
import type { CameraAdapter } from "../camera";
import type { PermissionAdapter } from "../permission";
import type { LocaleAdapter } from "../locale";

export interface BrowserAdapters {
  camera: CameraAdapter<MediaStream>;
  permission: PermissionAdapter;
  locale: LocaleAdapter;
}

export function createBrowserAdapters(): BrowserAdapters {
  return {
    camera: new BrowserCameraAdapter(),
    permission: new BrowserPermissionAdapter(),
    locale: new BrowserLocaleAdapter(),
  };
}

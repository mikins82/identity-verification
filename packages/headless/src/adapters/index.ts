export type { CameraAdapter, CameraStreamOptions } from "./camera";
export type { PermissionAdapter, PermissionState } from "./permission";
export type { LocaleAdapter } from "./locale";

export {
  BrowserCameraAdapter,
  BrowserPermissionAdapter,
  BrowserLocaleAdapter,
  createBrowserAdapters,
  type BrowserAdapters,
} from "./browser";

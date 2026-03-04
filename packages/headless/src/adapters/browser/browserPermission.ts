import type { PermissionAdapter, PermissionState } from "../permission";

export class BrowserPermissionAdapter implements PermissionAdapter {
  async query(): Promise<PermissionState> {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return "unavailable";
    }
    try {
      const status = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      return status.state as PermissionState;
    } catch {
      return "unavailable";
    }
  }

  subscribe(cb: (state: PermissionState) => void): () => void {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return () => {};
    }

    let removeListener: (() => void) | undefined;

    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((status) => {
        const onChange = () => cb(status.state as PermissionState);
        status.addEventListener("change", onChange);
        removeListener = () => status.removeEventListener("change", onChange);
      })
      .catch(() => {
        /* permissions.query not supported for camera in all browsers */
      });

    return () => removeListener?.();
  }
}

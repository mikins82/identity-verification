declare const require: (id: string) => unknown;

import type { CameraAdapter, CameraStreamOptions } from "../camera";

interface VisionCameraDevice {
  id: string;
  position: "front" | "back";
  [key: string]: unknown;
}

interface VisionCameraPhoto {
  path: string;
}

interface VisionCameraRef {
  takePhoto(options?: { qualityPrioritization?: "speed" | "balanced" | "quality" }): Promise<VisionCameraPhoto>;
}

interface VisionCameraModule {
  getAvailableCameraDevices(): VisionCameraDevice[];
}

interface RNFSModule {
  readFile(path: string, encoding: string): Promise<string>;
}

let Camera: VisionCameraModule | undefined;
let RNFS: RNFSModule | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Camera = require("react-native-vision-camera") as VisionCameraModule;
} catch {
  /* optional peer dep */
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  RNFS = require("react-native-fs") as RNFSModule;
} catch {
  /* optional peer dep */
}

export interface ReactNativeCameraStream {
  device: VisionCameraDevice;
  cameraRef: VisionCameraRef | null;
}

export class ReactNativeCameraAdapter implements CameraAdapter<ReactNativeCameraStream> {
  isAvailable(): boolean {
    return Camera !== undefined;
  }

  async requestStream(opts: CameraStreamOptions): Promise<ReactNativeCameraStream> {
    if (!Camera) {
      throw new Error("react-native-vision-camera is not installed");
    }

    const devices = Camera.getAvailableCameraDevices();
    const position = opts.facingMode === "environment" ? "back" : "front";
    const device = devices.find((d) => d.position === position) ?? devices[0];

    if (!device) {
      throw new Error("No camera device available");
    }

    return { device, cameraRef: null };
  }

  captureFrame(
    cameraRef: unknown,
    _stream: ReactNativeCameraStream,
    _quality: number,
  ): string | null {
    void cameraRef;
    return null;
  }

  stopStream(_stream: ReactNativeCameraStream): void {
    /* vision-camera manages its own lifecycle via the <Camera> component */
  }
}

export async function capturePhoto(
  cameraRef: VisionCameraRef,
): Promise<string> {
  const photo = await cameraRef.takePhoto({ qualityPrioritization: "balanced" });

  if (RNFS) {
    const base64 = await RNFS.readFile(photo.path, "base64");
    return `data:image/jpeg;base64,${base64}`;
  }

  return `file://${photo.path}`;
}

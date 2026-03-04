import { useState, useRef, useCallback, useEffect, type ReactElement, createElement } from "react";
import {
  CameraController,
  type CameraState,
  type CameraError,
  type CameraOptions,
} from "@identity-verification/headless";
import {
  ReactNativeCameraAdapter,
  capturePhoto,
} from "@identity-verification/headless/react-native";

export type { CameraState, CameraError };

interface UseCameraOptions {
  facingMode?: CameraOptions["facingMode"];
}

interface UseCameraReturn {
  CameraView: ReactElement | null;
  state: CameraState;
  capture: () => void;
  retake: () => void;
  retry: () => void;
}

let VisionCamera: unknown;
let useCameraDevice: ((position: string) => unknown) | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const vc = require("react-native-vision-camera");
  VisionCamera = vc.Camera;
  useCameraDevice = vc.useCameraDevice;
} catch {
  /* optional peer dep */
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { facingMode = "user" } = options;
  const cameraRef = useRef<{ takePhoto(opts?: Record<string, unknown>): Promise<{ path: string }> } | null>(null);
  const controllerRef = useRef<CameraController | null>(null);
  const [state, setState] = useState<CameraState>({ status: "initializing" });

  const position = facingMode === "environment" ? "back" : "front";
  const device = useCameraDevice?.(position) as Record<string, unknown> | undefined;

  useEffect(() => {
    const adapter = new ReactNativeCameraAdapter();
    const controller = new CameraController(adapter, { facingMode });
    controllerRef.current = controller;

    const unsub = controller.subscribe(setState);
    controller.start();

    return () => {
      unsub();
      controller.destroy();
      controllerRef.current = null;
    };
  }, [facingMode]);

  const capture = useCallback(async () => {
    if (!cameraRef.current || state.status !== "streaming") return;

    try {
      const imageData = await capturePhoto(cameraRef.current as never);
      controllerRef.current?.retake();
      setState({ status: "preview", imageData });
    } catch {
      setState({
        status: "error",
        error: { type: "stream-error", message: "Failed to capture photo" },
      });
    }
  }, [state.status]);

  const retake = useCallback(() => {
    controllerRef.current?.retake();
  }, []);

  const retry = useCallback(() => {
    controllerRef.current?.retry();
  }, []);

  let CameraView: ReactElement | null = null;
  if (VisionCamera && device && state.status === "streaming") {
    CameraView = createElement(VisionCamera as React.ComponentType<Record<string, unknown>>, {
      ref: cameraRef,
      device,
      isActive: true,
      photo: true,
      style: { flex: 1 },
    });
  }

  return { CameraView, state, capture, retake, retry };
}

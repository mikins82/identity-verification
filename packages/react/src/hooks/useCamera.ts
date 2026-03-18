import { useState, useRef, useCallback, useEffect } from "react";
import {
  CameraController,
  type CameraState,
  type CameraError,
  type CameraOptions,
} from "@identity-verification/headless";
import { BrowserCameraAdapter, BrowserPermissionAdapter } from "@identity-verification/headless/web";

export type { CameraState, CameraError };

interface UseCameraOptions {
  facingMode?: CameraOptions["facingMode"];
  imageQuality?: number;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  state: CameraState;
  capture: () => string | null;
  retake: () => void;
  retry: () => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { facingMode = "user", imageQuality = 0.8 } = options;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controllerRef = useRef<CameraController<MediaStream> | null>(null);
  const [state, setState] = useState<CameraState>({ status: "initializing" });

  useEffect(() => {
    const adapter = new BrowserCameraAdapter();
    const permission = new BrowserPermissionAdapter();
    const controller = new CameraController<MediaStream>(adapter, {
      facingMode,
      imageQuality,
      permission,
    });
    controllerRef.current = controller;

    const unsub = controller.subscribe(setState);
    controller.start();

    return () => {
      unsub();
      // Stop all media tracks so the camera is released (LED off, no ongoing stream)
      const stream = controller.getStream() as MediaStream | null;
      if (stream?.getTracks) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (videoRef.current?.srcObject) {
        const src = videoRef.current.srcObject as MediaStream;
        if (src?.getTracks) src.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      controller.destroy();
      controllerRef.current = null;
    };
  }, [facingMode, imageQuality]);

  useEffect(() => {
    if (state.status === "streaming" && videoRef.current) {
      const stream = controllerRef.current?.getStream();
      if (stream) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.play().catch(() => {
          /* autoplay restriction */
        });
      }
    }
  }, [state.status]);

  useEffect(() => {
    controllerRef.current?.setVideoElement(videoRef.current);
  });

  const capture = useCallback((): string | null => {
    return controllerRef.current?.capture() ?? null;
  }, []);

  const retake = useCallback(() => {
    controllerRef.current?.retake();
  }, []);

  const retry = useCallback(() => {
    controllerRef.current?.retry();
  }, []);

  return { videoRef, state, capture, retake, retry };
}

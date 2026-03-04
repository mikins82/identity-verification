import { useState, useRef, useCallback, useEffect } from "react";

export type CameraState =
  | { status: "initializing" }
  | { status: "permission-prompt" }
  | { status: "streaming" }
  | { status: "preview"; imageData: string }
  | { status: "error"; error: CameraError };

export interface CameraError {
  type: "not-supported" | "permission-denied" | "stream-error";
  message: string;
}

interface UseCameraOptions {
  facingMode?: "user" | "environment";
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
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const [state, setState] = useState<CameraState>({ status: "initializing" });

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      if (mountedRef.current) {
        setState({
          status: "error",
          error: {
            type: "not-supported",
            message: "Camera access requires HTTPS and a supported browser.",
          },
        });
      }
      return;
    }

    if (mountedRef.current) setState({ status: "permission-prompt" });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (!mountedRef.current) {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        return;
      }

      streamRef.current = stream;
      setState({ status: "streaming" });
    } catch (err) {
      if (!mountedRef.current) return;
      const domError = err as DOMException;
      if (domError.name === "NotAllowedError" || domError.name === "PermissionDeniedError") {
        setState({
          status: "error",
          error: {
            type: "permission-denied",
            message:
              "Camera permission was denied. Please allow camera access in your browser settings.",
          },
        });
      } else {
        setState({
          status: "error",
          error: {
            type: "stream-error",
            message: "Could not access camera. It may be in use by another application.",
          },
        });
      }
    }
  }, [facingMode]);

  useEffect(() => {
    if (state.status === "streaming" && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.play().catch(() => {
        /* autoplay restriction — safe to ignore */
      });
    }
  }, [state.status]);

  const capture = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || state.status !== "streaming") return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", imageQuality);

    if (!imageData || !imageData.startsWith("data:image/")) return null;

    stopStream();
    setState({ status: "preview", imageData });
    return imageData;
  }, [state.status, imageQuality, stopStream]);

  const retake = useCallback(() => {
    stopStream();
    setState({ status: "initializing" });
    startCamera();
  }, [startCamera, stopStream]);

  const retry = useCallback(() => {
    stopStream();
    setState({ status: "initializing" });
    startCamera();
  }, [startCamera, stopStream]);

  useEffect(() => {
    mountedRef.current = true;
    startCamera();
    return () => {
      mountedRef.current = false;
      stopStream();
    };
  }, [startCamera, stopStream]);

  return { videoRef, state, capture, retake, retry };
}

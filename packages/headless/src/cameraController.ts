import type { CameraAdapter } from "./adapters/camera";

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

export interface CameraOptions {
  facingMode?: "user" | "environment";
  imageQuality?: number;
}

export class CameraController<TStream = unknown> {
  private adapter: CameraAdapter<TStream>;
  private facingMode: "user" | "environment";
  private imageQuality: number;
  private stream: TStream | null = null;
  private videoElement: unknown | null = null;
  private listeners = new Set<(state: CameraState) => void>();
  private _state: CameraState = { status: "initializing" };
  private destroyed = false;

  constructor(adapter: CameraAdapter<TStream>, options: CameraOptions = {}) {
    this.adapter = adapter;
    this.facingMode = options.facingMode ?? "user";
    this.imageQuality = options.imageQuality ?? 0.8;
  }

  get state(): CameraState {
    return this._state;
  }

  subscribe(listener: (state: CameraState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  setVideoElement(video: unknown): void {
    this.videoElement = video;
  }

  getStream(): TStream | null {
    return this.stream;
  }

  async start(): Promise<void> {
    if (this.destroyed) return;

    if (!this.adapter.isAvailable()) {
      this.setState({
        status: "error",
        error: {
          type: "not-supported",
          message:
            "Camera access requires HTTPS and a supported browser.",
        },
      });
      return;
    }

    this.setState({ status: "permission-prompt" });

    try {
      const stream = await this.adapter.requestStream({
        facingMode: this.facingMode,
      });

      if (this.destroyed) {
        this.adapter.stopStream(stream);
        return;
      }

      this.stream = stream;
      this.setState({ status: "streaming" });
    } catch (err) {
      if (this.destroyed) return;

      const domError = err as DOMException;
      if (
        domError.name === "NotAllowedError" ||
        domError.name === "PermissionDeniedError"
      ) {
        this.setState({
          status: "error",
          error: {
            type: "permission-denied",
            message:
              "Camera permission was denied. Please allow camera access in your browser settings.",
          },
        });
      } else {
        this.setState({
          status: "error",
          error: {
            type: "stream-error",
            message:
              "Could not access camera. It may be in use by another application.",
          },
        });
      }
    }
  }

  capture(quality?: number): string | null {
    if (this._state.status !== "streaming" || !this.stream) return null;

    const imageData = this.adapter.captureFrame(
      this.videoElement,
      this.stream,
      quality ?? this.imageQuality,
    );
    if (!imageData) return null;

    this.stopStreamInternal();
    this.setState({ status: "preview", imageData });
    return imageData;
  }

  retake(): void {
    this.stopStreamInternal();
    this.setState({ status: "initializing" });
    this.start();
  }

  retry(): void {
    this.stopStreamInternal();
    this.setState({ status: "initializing" });
    this.start();
  }

  destroy(): void {
    this.destroyed = true;
    this.stopStreamInternal();
    this.listeners.clear();
  }

  private stopStreamInternal(): void {
    if (this.stream) {
      this.adapter.stopStream(this.stream);
      this.stream = null;
    }
  }

  private setState(next: CameraState): void {
    this._state = next;
    for (const listener of this.listeners) {
      listener(next);
    }
  }
}

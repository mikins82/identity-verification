export interface CameraStreamOptions {
  facingMode: "user" | "environment";
  width?: number;
  height?: number;
}

export interface CameraAdapter<TStream = unknown> {
  isAvailable(): boolean;
  requestStream(opts: CameraStreamOptions): Promise<TStream>;
  captureFrame(
    video: unknown,
    stream: TStream,
    quality: number,
  ): string | null;
  stopStream(stream: TStream): void;
}

import type { CameraAdapter, CameraStreamOptions } from "../camera";

export class BrowserCameraAdapter implements CameraAdapter<MediaStream> {
  isAvailable(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia
    );
  }

  async requestStream(opts: CameraStreamOptions): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: opts.facingMode,
        width: opts.width ? { ideal: opts.width } : { ideal: 720 },
        height: opts.height ? { ideal: opts.height } : { ideal: 1280 },
      },
    });
  }

  captureFrame(
    video: unknown,
    _stream: MediaStream,
    quality: number,
  ): string | null {
    const el = video as HTMLVideoElement;
    if (!el || typeof el.videoWidth !== "number") return null;

    const canvas = document.createElement("canvas");
    canvas.width = el.videoWidth || 720;
    canvas.height = el.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Mirror horizontally for selfie-style capture
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(el, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", quality);
    if (!imageData || !imageData.startsWith("data:image/")) return null;

    return imageData;
  }

  stopStream(stream: MediaStream): void {
    stream.getTracks().forEach((t) => t.stop());
  }
}

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useCamera } from "./useCamera";

function createMockStream(): MediaStream {
  const track = {
    kind: "video",
    stop: vi.fn(),
    getSettings: () => ({ width: 640, height: 480 }),
    enabled: true,
    readyState: "live",
  } as unknown as MediaStreamTrack;

  return {
    getTracks: () => [track],
    getVideoTracks: () => [track],
    active: true,
  } as unknown as MediaStream;
}

function setupCameraMocks(stream?: MediaStream) {
  const mockStream = stream ?? createMockStream();
  const getUserMedia = vi.fn().mockResolvedValue(mockStream);

  Object.defineProperty(navigator, "mediaDevices", {
    value: { getUserMedia },
    writable: true,
    configurable: true,
  });

  Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
    value: 640,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
    value: 480,
    writable: true,
    configurable: true,
  });
  HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);

  const mockCtx = { translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() };
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx);
  HTMLCanvasElement.prototype.toDataURL = vi
    .fn()
    .mockReturnValue("data:image/jpeg;base64,mockData");

  return { getUserMedia, stream: mockStream };
}

function clearCameraMocks() {
  Object.defineProperty(navigator, "mediaDevices", {
    value: undefined,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(navigator, "permissions", {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

describe("useCamera", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    clearCameraMocks();
  });

  it("reaches permission-prompt state synchronously after mount", () => {
    setupCameraMocks();
    const { result } = renderHook(() => useCamera());
    expect(result.current.state.status).toBe("permission-prompt");
  });

  it("transitions to streaming when camera is available", async () => {
    setupCameraMocks();
    const { result } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(result.current.state.status).toBe("streaming");
    });
  });

  it("transitions to error when mediaDevices is unavailable", async () => {
    clearCameraMocks();
    const { result } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
      if (result.current.state.status === "error") {
        expect(result.current.state.error.type).toBe("not-supported");
      }
    });
  });

  it("reports permission-denied on NotAllowedError", async () => {
    const getUserMedia = vi
      .fn()
      .mockRejectedValue(new DOMException("", "NotAllowedError"));
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
      if (result.current.state.status === "error") {
        expect(result.current.state.error.type).toBe("permission-denied");
      }
    });
  });

  it("reports stream-error on NotReadableError", async () => {
    const getUserMedia = vi
      .fn()
      .mockRejectedValue(new DOMException("", "NotReadableError"));
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(result.current.state.status).toBe("error");
      if (result.current.state.status === "error") {
        expect(result.current.state.error.type).toBe("stream-error");
      }
    });
  });

  it("provides a videoRef that starts as null", () => {
    setupCameraMocks();
    const { result } = renderHook(() => useCamera());
    expect(result.current.videoRef.current).toBeNull();
  });

  it("returns stable capture, retake, and retry functions across rerenders", () => {
    setupCameraMocks();
    const { result, rerender } = renderHook(() => useCamera());

    const { capture, retake, retry } = result.current;
    rerender();
    expect(result.current.capture).toBe(capture);
    expect(result.current.retake).toBe(retake);
    expect(result.current.retry).toBe(retry);
  });

  it("uses custom facingMode option", async () => {
    const { getUserMedia } = setupCameraMocks();
    renderHook(() => useCamera({ facingMode: "environment" }));

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledWith(
        expect.objectContaining({
          video: expect.objectContaining({ facingMode: "environment" }),
        }),
      );
    });
  });

  it("destroys controller and stops stream on unmount", async () => {
    const { stream } = setupCameraMocks();
    const { result, unmount } = renderHook(() => useCamera());

    await waitFor(() => {
      expect(result.current.state.status).toBe("streaming");
    });

    unmount();
    expect(stream.getTracks()[0].stop).toHaveBeenCalled();
  });

  it("re-creates controller when facingMode changes", async () => {
    const { getUserMedia } = setupCameraMocks();
    const { rerender } = renderHook(
      ({ facingMode }) => useCamera({ facingMode }),
      { initialProps: { facingMode: "user" as const } },
    );

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledTimes(1);
    });

    rerender({ facingMode: "environment" });

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledTimes(2);
    });
  });
});

import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SelfieCapture } from "./SelfieCapture";

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

  const mockCtx = { drawImage: vi.fn() };
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(mockCtx);
  HTMLCanvasElement.prototype.toDataURL = vi
    .fn()
    .mockReturnValue("data:image/jpeg;base64,mockImageData");

  return { getUserMedia, stream: mockStream };
}

function clearCameraMocks() {
  Object.defineProperty(navigator, "mediaDevices", {
    value: undefined,
    writable: true,
    configurable: true,
  });
}

describe("SelfieCapture", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    clearCameraMocks();
  });

  it("shows loading state initially", () => {
    setupCameraMocks();
    render(<SelfieCapture onCapture={vi.fn()} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows streaming state with capture button when camera is available", async () => {
    setupCameraMocks();
    render(<SelfieCapture onCapture={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });
  });

  it("shows error when mediaDevices is unavailable", async () => {
    clearCameraMocks();
    render(<SelfieCapture onCapture={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Camera Not Available")).toBeInTheDocument();
    });
  });

  it("shows permission denied error when user blocks camera", async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new DOMException("", "NotAllowedError"));
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      writable: true,
      configurable: true,
    });

    render(<SelfieCapture onCapture={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Camera Access Denied")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });

  it("shows stream error for other camera failures", async () => {
    const getUserMedia = vi
      .fn()
      .mockRejectedValue(new DOMException("", "NotReadableError"));
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      writable: true,
      configurable: true,
    });

    render(<SelfieCapture onCapture={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Camera Error")).toBeInTheDocument();
    });
  });

  it("transitions to preview when capture button is clicked", async () => {
    setupCameraMocks();
    render(<SelfieCapture onCapture={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });

    expect(screen.getByAltText("Captured selfie")).toBeInTheDocument();
    expect(screen.getByText("Retake")).toBeInTheDocument();
    expect(screen.getByText("Use this photo")).toBeInTheDocument();
  });

  it("calls onCapture with base64 data when accept is clicked", async () => {
    setupCameraMocks();
    const onCapture = vi.fn();
    render(<SelfieCapture onCapture={onCapture} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });

    fireEvent.click(screen.getByText("Use this photo"));
    expect(onCapture).toHaveBeenCalledWith("data:image/jpeg;base64,mockImageData");
  });

  it("returns to streaming when retake is clicked", async () => {
    setupCameraMocks();
    render(<SelfieCapture onCapture={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });

    expect(screen.getByText("Retake")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("Retake"));
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });
  });

  it("stops stream tracks when capture is taken", async () => {
    const { stream } = setupCameraMocks();
    render(<SelfieCapture onCapture={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });

    expect(stream.getTracks()[0].stop).toHaveBeenCalled();
  });

  it("calls onError when camera error occurs", async () => {
    const getUserMedia = vi.fn().mockRejectedValue(new DOMException("", "NotAllowedError"));
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      writable: true,
      configurable: true,
    });

    const onError = vi.fn();
    render(<SelfieCapture onCapture={vi.fn()} onError={onError} />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ type: "permission-denied" }),
      );
    });
  });

  it("retries camera after permission denied and clicking Try Again", async () => {
    const getUserMedia = vi
      .fn()
      .mockRejectedValueOnce(new DOMException("", "NotAllowedError"))
      .mockResolvedValueOnce(createMockStream());
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia },
      writable: true,
      configurable: true,
    });

    HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
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

    render(<SelfieCapture onCapture={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Try Again"));
    });

    await waitFor(() => {
      expect(getUserMedia).toHaveBeenCalledTimes(2);
    });
  });
});

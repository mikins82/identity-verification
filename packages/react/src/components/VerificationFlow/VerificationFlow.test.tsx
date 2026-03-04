import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { VerificationFlow } from "./VerificationFlow";

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

function setupCameraMocks() {
  const mockStream = createMockStream();
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

describe("VerificationFlow", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    clearCameraMocks();
  });

  it("starts at the selfie step", () => {
    setupCameraMocks();
    render(<VerificationFlow onComplete={vi.fn()} />);
    expect(screen.getByText("Selfie")).toBeInTheDocument();
  });

  it("shows step indicator with 3 steps", () => {
    setupCameraMocks();
    render(<VerificationFlow onComplete={vi.fn()} />);
    expect(screen.getByText("Selfie")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
    expect(screen.getByText("Address")).toBeInTheDocument();
  });

  it("disables Next button when selfie is not captured", () => {
    setupCameraMocks();
    render(<VerificationFlow onComplete={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("disables Back button on first step", () => {
    setupCameraMocks();
    render(<VerificationFlow onComplete={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();
  });

  it("advances to phone step after selfie capture", async () => {
    setupCameraMocks();
    render(<VerificationFlow onComplete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });

    fireEvent.click(screen.getByText("Use this photo"));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Next" })).not.toBeDisabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });

    await waitFor(() => {
      const phonePanel = document.getElementById("iv-step-phone");
      expect(phonePanel).toHaveAttribute("aria-hidden", "false");
    });
  });

  it("navigates back preserving selfie data", async () => {
    setupCameraMocks();
    render(<VerificationFlow onComplete={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });
    fireEvent.click(screen.getByText("Use this photo"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Back" }));
    });

    await waitFor(() => {
      expect(screen.getByAltText("Captured selfie")).toBeInTheDocument();
    });
  });

  it("fires onStepChange callback on step transitions", async () => {
    setupCameraMocks();
    const onStepChange = vi.fn();
    render(<VerificationFlow onComplete={vi.fn()} onStepChange={onStepChange} />);

    expect(onStepChange).toHaveBeenCalledWith("selfie");

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });
    fireEvent.click(screen.getByText("Use this photo"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });

    await waitFor(() => {
      expect(onStepChange).toHaveBeenCalledWith("phone");
    });
  });

  it("shows retry button on failure", async () => {
    setupCameraMocks();

    vi.spyOn(global.Math, "random").mockReturnValue(0.1);

    render(
      <VerificationFlow
        onComplete={vi.fn()}
        verificationOptions={{ simulatedLatencyMs: 0 }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });
    fireEvent.click(screen.getByText("Use this photo"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });

    const phoneInput = screen.getByLabelText("Phone number");
    fireEvent.change(phoneInput, { target: { value: "4155552671" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });

    const streetInput = screen.getByPlaceholderText("123 Main St");
    const cityInput = screen.getByPlaceholderText("City");
    const stateInput = screen.getByPlaceholderText("State");
    const postalInput = screen.getByPlaceholderText("Postal code");

    fireEvent.change(streetInput, { target: { value: "123 Main St" } });
    fireEvent.change(cityInput, { target: { value: "San Francisco" } });
    fireEvent.change(stateInput, { target: { value: "CA" } });
    fireEvent.change(postalInput, { target: { value: "94102" } });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Verification Failed")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });

  it("resets to step 1 when retry is clicked", async () => {
    setupCameraMocks();

    vi.spyOn(global.Math, "random").mockReturnValue(0.1);

    render(
      <VerificationFlow
        onComplete={vi.fn()}
        verificationOptions={{ simulatedLatencyMs: 0 }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Take photo")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByLabelText("Take photo"));
    });
    fireEvent.click(screen.getByText("Use this photo"));

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });

    fireEvent.change(screen.getByLabelText("Phone number"), {
      target: { value: "4155552671" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Next" }));
    });

    fireEvent.change(screen.getByPlaceholderText("123 Main St"), {
      target: { value: "123 Main St" },
    });
    fireEvent.change(screen.getByPlaceholderText("City"), {
      target: { value: "San Francisco" },
    });
    fireEvent.change(screen.getByPlaceholderText("State"), {
      target: { value: "CA" },
    });
    fireEvent.change(screen.getByPlaceholderText("Postal code"), {
      target: { value: "94102" },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    });

    await waitFor(() => {
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Try Again"));
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Next" }),
      ).toBeInTheDocument();
    });
  });
});

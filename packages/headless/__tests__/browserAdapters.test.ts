/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { BrowserCameraAdapter } from "../src/adapters/browser/browserCamera";
import { BrowserPermissionAdapter } from "../src/adapters/browser/browserPermission";
import { BrowserLocaleAdapter } from "../src/adapters/browser/browserLocale";
import { createBrowserAdapters } from "../src/adapters/browser";

describe("BrowserCameraAdapter", () => {
  let adapter: BrowserCameraAdapter;

  beforeEach(() => {
    adapter = new BrowserCameraAdapter();
  });

  describe("isAvailable()", () => {
    it("returns true when getUserMedia exists", () => {
      Object.defineProperty(navigator, "mediaDevices", {
        value: { getUserMedia: vi.fn() },
        configurable: true,
      });
      expect(adapter.isAvailable()).toBe(true);
    });

    it("returns false when mediaDevices is missing", () => {
      Object.defineProperty(navigator, "mediaDevices", {
        value: undefined,
        configurable: true,
      });
      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe("requestStream()", () => {
    it("calls getUserMedia with video constraints", async () => {
      const fakeStream = { getTracks: () => [] };
      const getUserMedia = vi.fn().mockResolvedValue(fakeStream);
      Object.defineProperty(navigator, "mediaDevices", {
        value: { getUserMedia },
        configurable: true,
      });

      const result = await adapter.requestStream({ facingMode: "user" });

      expect(result).toBe(fakeStream);
      expect(getUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
      });
    });

    it("uses custom dimensions when provided", async () => {
      const getUserMedia = vi.fn().mockResolvedValue({ getTracks: () => [] });
      Object.defineProperty(navigator, "mediaDevices", {
        value: { getUserMedia },
        configurable: true,
      });

      await adapter.requestStream({ facingMode: "environment", width: 1920, height: 1080 });

      expect(getUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
    });
  });

  describe("captureFrame()", () => {
    it("returns a data URL from canvas", () => {
      const expectedDataUrl = "data:image/jpeg;base64,fakedata";
      const mockCtx = {
        translate: vi.fn(),
        scale: vi.fn(),
        drawImage: vi.fn(),
      };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toDataURL: vi.fn(() => expectedDataUrl),
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as unknown as HTMLElement);

      const video = { videoWidth: 640, videoHeight: 480 } as unknown;
      const stream = {} as MediaStream;

      const result = adapter.captureFrame(video, stream, 0.8);

      expect(result).toBe(expectedDataUrl);
      expect(mockCanvas.width).toBe(640);
      expect(mockCanvas.height).toBe(480);
      expect(mockCtx.translate).toHaveBeenCalledWith(640, 0);
      expect(mockCtx.scale).toHaveBeenCalledWith(-1, 1);
      expect(mockCtx.drawImage).toHaveBeenCalledWith(video, 0, 0);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.8);
    });

    it("returns null when video element is falsy", () => {
      expect(adapter.captureFrame(null, {} as MediaStream, 0.8)).toBeNull();
    });

    it("returns null when videoWidth is missing", () => {
      expect(adapter.captureFrame({}, {} as MediaStream, 0.8)).toBeNull();
    });

    it("returns null when getContext returns null", () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => null),
        toDataURL: vi.fn(),
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as unknown as HTMLElement);

      const video = { videoWidth: 640, videoHeight: 480 } as unknown;
      expect(adapter.captureFrame(video, {} as MediaStream, 0.8)).toBeNull();
    });

    it("returns null when toDataURL returns non-image string", () => {
      const mockCtx = { translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toDataURL: vi.fn(() => ""),
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as unknown as HTMLElement);

      const video = { videoWidth: 640, videoHeight: 480 } as unknown;
      expect(adapter.captureFrame(video, {} as MediaStream, 0.8)).toBeNull();
    });

    it("defaults canvas dimensions when video dimensions are 0", () => {
      const mockCtx = { translate: vi.fn(), scale: vi.fn(), drawImage: vi.fn() };
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toDataURL: vi.fn(() => "data:image/jpeg;base64,ok"),
      };
      vi.spyOn(document, "createElement").mockReturnValue(mockCanvas as unknown as HTMLElement);

      const video = { videoWidth: 0, videoHeight: 0 } as unknown;
      adapter.captureFrame(video, {} as MediaStream, 0.8);

      expect(mockCanvas.width).toBe(720);
      expect(mockCanvas.height).toBe(1280);
    });
  });

  describe("stopStream()", () => {
    it("stops all tracks on the stream", () => {
      const track1 = { stop: vi.fn() };
      const track2 = { stop: vi.fn() };
      const stream = { getTracks: () => [track1, track2] } as unknown as MediaStream;

      adapter.stopStream(stream);

      expect(track1.stop).toHaveBeenCalled();
      expect(track2.stop).toHaveBeenCalled();
    });
  });
});

describe("BrowserPermissionAdapter", () => {
  let adapter: BrowserPermissionAdapter;

  beforeEach(() => {
    adapter = new BrowserPermissionAdapter();
  });

  describe("query()", () => {
    it("returns the permission state", async () => {
      Object.defineProperty(navigator, "permissions", {
        value: {
          query: vi.fn().mockResolvedValue({ state: "granted" }),
        },
        configurable: true,
      });

      const state = await adapter.query();
      expect(state).toBe("granted");
    });

    it("returns unavailable when permissions API is missing", async () => {
      Object.defineProperty(navigator, "permissions", {
        value: undefined,
        configurable: true,
      });

      const state = await adapter.query();
      expect(state).toBe("unavailable");
    });

    it("returns unavailable when query throws", async () => {
      Object.defineProperty(navigator, "permissions", {
        value: {
          query: vi.fn().mockRejectedValue(new Error("Not supported")),
        },
        configurable: true,
      });

      const state = await adapter.query();
      expect(state).toBe("unavailable");
    });
  });

  describe("subscribe()", () => {
    it("registers a change listener on the permission status", async () => {
      const listeners: Array<() => void> = [];
      const mockStatus = {
        state: "prompt",
        addEventListener: vi.fn((_: string, cb: () => void) => listeners.push(cb)),
        removeEventListener: vi.fn(),
      };
      Object.defineProperty(navigator, "permissions", {
        value: { query: vi.fn().mockResolvedValue(mockStatus) },
        configurable: true,
      });

      const cb = vi.fn();
      const unsub = adapter.subscribe(cb);

      await vi.waitFor(() => expect(mockStatus.addEventListener).toHaveBeenCalledWith("change", expect.any(Function)));

      mockStatus.state = "granted";
      listeners[0]();
      expect(cb).toHaveBeenCalledWith("granted");

      unsub();
      expect(mockStatus.removeEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    });

    it("returns a no-op when permissions API is missing", () => {
      Object.defineProperty(navigator, "permissions", {
        value: undefined,
        configurable: true,
      });

      const unsub = adapter.subscribe(vi.fn());
      expect(unsub).toBeTypeOf("function");
      unsub();
    });
  });
});

describe("BrowserLocaleAdapter", () => {
  let adapter: BrowserLocaleAdapter;
  const originalLanguage = navigator.language;

  beforeEach(() => {
    adapter = new BrowserLocaleAdapter();
  });

  afterEach(() => {
    Object.defineProperty(navigator, "language", {
      value: originalLanguage,
      configurable: true,
    });
  });

  it("returns the region from navigator.language when it matches a known country", () => {
    Object.defineProperty(navigator, "language", { value: "en-US", configurable: true });
    expect(adapter.getDefaultCountryCode()).toBe("US");
  });

  it("returns US for a language with a recognized region code", () => {
    Object.defineProperty(navigator, "language", { value: "en-CA", configurable: true });
    expect(adapter.getDefaultCountryCode()).toBe("CA");
  });

  it("returns US when there is no region subtag", () => {
    Object.defineProperty(navigator, "language", { value: "en", configurable: true });
    expect(adapter.getDefaultCountryCode()).toBe("US");
  });

  it("returns US when the region is not in COUNTRIES", () => {
    Object.defineProperty(navigator, "language", { value: "xx-ZZ", configurable: true });
    expect(adapter.getDefaultCountryCode()).toBe("US");
  });
});

describe("createBrowserAdapters()", () => {
  it("returns an object with camera, permission, and locale adapters", () => {
    const adapters = createBrowserAdapters();

    expect(adapters.camera).toBeInstanceOf(BrowserCameraAdapter);
    expect(adapters.permission).toBeInstanceOf(BrowserPermissionAdapter);
    expect(adapters.locale).toBeInstanceOf(BrowserLocaleAdapter);
  });
});

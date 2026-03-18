import { describe, it, expect, vi, beforeEach } from "vitest";
import { CameraController } from "../src/cameraController";
import type { CameraAdapter, CameraStreamOptions } from "../src/adapters/camera";
import type { PermissionAdapter, PermissionState } from "../src/adapters/permission";
import type { CameraState } from "../src/cameraController";

type MockStream = { id: string };

function createMockAdapter(
  overrides: Partial<CameraAdapter<MockStream>> = {},
): CameraAdapter<MockStream> {
  return {
    isAvailable: vi.fn(() => true),
    requestStream: vi.fn(async () => ({ id: "mock-stream" })),
    captureFrame: vi.fn(() => "data:image/jpeg;base64,captured"),
    stopStream: vi.fn(),
    ...overrides,
  };
}

function createMockPermission(
  state: PermissionState = "prompt",
): PermissionAdapter {
  return {
    query: vi.fn(async () => state),
    subscribe: vi.fn(() => () => {}),
  };
}

function collectStates(controller: CameraController<MockStream>): CameraState[] {
  const states: CameraState[] = [];
  controller.subscribe((s) => states.push(s));
  return states;
}

describe("CameraController", () => {
  let adapter: CameraAdapter<MockStream>;
  let controller: CameraController<MockStream>;

  beforeEach(() => {
    adapter = createMockAdapter();
    controller = new CameraController(adapter);
  });

  describe("initial state", () => {
    it("starts in initializing status", () => {
      expect(controller.state).toEqual({ status: "initializing" });
    });

    it("has no stream initially", () => {
      expect(controller.getStream()).toBeNull();
    });
  });

  describe("subscribe", () => {
    it("notifies listeners on state changes", async () => {
      const states = collectStates(controller);
      await controller.start();
      expect(states.length).toBeGreaterThanOrEqual(2);
      expect(states[0]).toEqual({ status: "permission-prompt" });
      expect(states[1]).toEqual({ status: "streaming" });
    });

    it("returns an unsubscribe function", async () => {
      const states: CameraState[] = [];
      const unsub = controller.subscribe((s) => states.push(s));
      unsub();
      await controller.start();
      expect(states).toHaveLength(0);
    });
  });

  describe("start()", () => {
    it("transitions to permission-prompt then streaming", async () => {
      const states = collectStates(controller);
      await controller.start();

      expect(states).toEqual([
        { status: "permission-prompt" },
        { status: "streaming" },
      ]);
      expect(controller.state).toEqual({ status: "streaming" });
      expect(controller.getStream()).toEqual({ id: "mock-stream" });
    });

    it("passes facingMode from options to adapter", async () => {
      const envAdapter = createMockAdapter();
      const envController = new CameraController(envAdapter, { facingMode: "environment" });
      await envController.start();

      expect(envAdapter.requestStream).toHaveBeenCalledWith({ facingMode: "environment" });
      envController.destroy();
    });

    it("defaults to user facingMode", async () => {
      await controller.start();
      expect(adapter.requestStream).toHaveBeenCalledWith({ facingMode: "user" });
    });

    it("sets not-supported error when adapter is unavailable", async () => {
      adapter = createMockAdapter({ isAvailable: vi.fn(() => false) });
      controller = new CameraController(adapter);
      const states = collectStates(controller);

      await controller.start();

      expect(states).toHaveLength(1);
      expect(controller.state).toEqual({
        status: "error",
        error: { type: "not-supported", message: expect.any(String) },
      });
    });

    it("sets permission-denied error for NotAllowedError", async () => {
      const err = new DOMException("User denied", "NotAllowedError");
      adapter = createMockAdapter({ requestStream: vi.fn(async () => { throw err; }) });
      controller = new CameraController(adapter);
      const states = collectStates(controller);

      await controller.start();

      expect(states).toHaveLength(2);
      expect(states[0]).toEqual({ status: "permission-prompt" });
      expect(controller.state).toEqual({
        status: "error",
        error: { type: "permission-denied", message: expect.any(String) },
      });
    });

    it("sets permission-denied error for PermissionDeniedError", async () => {
      const err = new DOMException("Denied", "PermissionDeniedError");
      adapter = createMockAdapter({ requestStream: vi.fn(async () => { throw err; }) });
      controller = new CameraController(adapter);

      await controller.start();

      expect(controller.state).toEqual({
        status: "error",
        error: { type: "permission-denied", message: expect.any(String) },
      });
    });

    it("sets permission-blocked when permission adapter reports denied", async () => {
      const err = new DOMException("User denied", "NotAllowedError");
      adapter = createMockAdapter({ requestStream: vi.fn(async () => { throw err; }) });
      const permission = createMockPermission("denied");
      controller = new CameraController(adapter, { permission });

      await controller.start();

      expect(controller.state).toEqual({
        status: "error",
        error: { type: "permission-blocked", message: expect.any(String) },
      });
      expect(permission.query).toHaveBeenCalled();
    });

    it("sets permission-denied when permission adapter reports prompt", async () => {
      const err = new DOMException("User denied", "NotAllowedError");
      adapter = createMockAdapter({ requestStream: vi.fn(async () => { throw err; }) });
      const permission = createMockPermission("prompt");
      controller = new CameraController(adapter, { permission });

      await controller.start();

      expect(controller.state).toEqual({
        status: "error",
        error: { type: "permission-denied", message: expect.any(String) },
      });
    });

    it("sets stream-error for other exceptions", async () => {
      adapter = createMockAdapter({
        requestStream: vi.fn(async () => { throw new DOMException("Busy", "NotReadableError"); }),
      });
      controller = new CameraController(adapter);

      await controller.start();

      expect(controller.state).toEqual({
        status: "error",
        error: { type: "stream-error", message: expect.any(String) },
      });
    });

    it("does nothing when already destroyed", async () => {
      controller.destroy();
      await controller.start();
      expect(controller.state).toEqual({ status: "initializing" });
      expect(adapter.requestStream).not.toHaveBeenCalled();
    });

    it("stops stream if destroyed during requestStream", async () => {
      const streamObj: MockStream = { id: "late-stream" };
      adapter = createMockAdapter({
        requestStream: vi.fn(async () => {
          controller.destroy();
          return streamObj;
        }),
      });
      controller = new CameraController(adapter);

      await controller.start();

      expect(adapter.stopStream).toHaveBeenCalledWith(streamObj);
    });
  });

  describe("capture()", () => {
    it("captures a frame and transitions to preview", async () => {
      await controller.start();
      controller.setVideoElement({ videoWidth: 720, videoHeight: 1280 });

      const imageData = controller.capture();

      expect(imageData).toBe("data:image/jpeg;base64,captured");
      expect(controller.state).toEqual({ status: "preview", imageData: "data:image/jpeg;base64,captured" });
      expect(adapter.captureFrame).toHaveBeenCalledWith(
        { videoWidth: 720, videoHeight: 1280 },
        { id: "mock-stream" },
        0.8,
      );
    });

    it("uses custom quality when provided", async () => {
      await controller.start();
      controller.capture(0.5);

      expect(adapter.captureFrame).toHaveBeenCalledWith(null, { id: "mock-stream" }, 0.5);
    });

    it("uses imageQuality from constructor options", async () => {
      const ctrl = new CameraController(adapter, { imageQuality: 0.95 });
      await ctrl.start();
      ctrl.capture();

      expect(adapter.captureFrame).toHaveBeenCalledWith(null, { id: "mock-stream" }, 0.95);
      ctrl.destroy();
    });

    it("returns null when not streaming", () => {
      expect(controller.capture()).toBeNull();
      expect(adapter.captureFrame).not.toHaveBeenCalled();
    });

    it("returns null when adapter returns null", async () => {
      adapter = createMockAdapter({ captureFrame: vi.fn(() => null) });
      controller = new CameraController(adapter);
      await controller.start();

      expect(controller.capture()).toBeNull();
      expect(controller.state).toEqual({ status: "streaming" });
    });

    it("stops the stream after successful capture", async () => {
      await controller.start();
      controller.capture();

      expect(adapter.stopStream).toHaveBeenCalledWith({ id: "mock-stream" });
      expect(controller.getStream()).toBeNull();
    });
  });

  describe("retake()", () => {
    it("stops stream and restarts the camera", async () => {
      await controller.start();
      controller.capture();
      expect(controller.state.status).toBe("preview");

      await controller.retake();

      expect(adapter.stopStream).toHaveBeenCalled();
      expect(controller.state).toEqual({ status: "streaming" });
    });
  });

  describe("retry()", () => {
    it("stops stream and restarts after a transient error", async () => {
      const err = new DOMException("Busy", "NotReadableError");
      let callCount = 0;
      adapter = createMockAdapter({
        requestStream: vi.fn(async () => {
          callCount++;
          if (callCount === 1) throw err;
          return { id: "retry-stream" };
        }),
      });
      controller = new CameraController(adapter);

      await controller.start();
      expect(controller.state.status).toBe("error");

      await controller.retry();
      expect(controller.state).toEqual({ status: "streaming" });
    });

    it("sets permission-blocked instead of retrying when permission is denied", async () => {
      const err = new DOMException("User denied", "NotAllowedError");
      adapter = createMockAdapter({ requestStream: vi.fn(async () => { throw err; }) });
      const permission = createMockPermission("denied");
      controller = new CameraController(adapter, { permission });

      await controller.start();
      expect(controller.state.status).toBe("error");

      await controller.retry();

      expect(controller.state).toEqual({
        status: "error",
        error: { type: "permission-blocked", message: expect.any(String) },
      });
      expect(adapter.requestStream).toHaveBeenCalledTimes(1);
    });

    it("retries normally when permission adapter reports prompt", async () => {
      const err = new DOMException("User denied", "NotAllowedError");
      let callCount = 0;
      adapter = createMockAdapter({
        requestStream: vi.fn(async () => {
          callCount++;
          if (callCount === 1) throw err;
          return { id: "retry-stream" };
        }),
      });
      const permission = createMockPermission("prompt");
      controller = new CameraController(adapter, { permission });

      await controller.start();
      expect(controller.state.status).toBe("error");

      await controller.retry();
      expect(controller.state).toEqual({ status: "streaming" });
      expect(adapter.requestStream).toHaveBeenCalledTimes(2);
    });

    it("does nothing when already destroyed", async () => {
      adapter = createMockAdapter({
        requestStream: vi.fn(async () => { throw new DOMException("Busy", "NotReadableError"); }),
      });
      controller = new CameraController(adapter);

      await controller.start();
      controller.destroy();
      await controller.retry();

      expect(adapter.requestStream).toHaveBeenCalledTimes(1);
    });
  });

  describe("destroy()", () => {
    it("stops the active stream", async () => {
      await controller.start();
      controller.destroy();

      expect(adapter.stopStream).toHaveBeenCalledWith({ id: "mock-stream" });
      expect(controller.getStream()).toBeNull();
    });

    it("clears all listeners", async () => {
      const listener = vi.fn();
      controller.subscribe(listener);
      controller.destroy();

      controller.setVideoElement({});
      expect(listener).not.toHaveBeenCalled();
    });

    it("is safe to call multiple times", async () => {
      await controller.start();
      controller.destroy();
      controller.destroy();
      expect(adapter.stopStream).toHaveBeenCalledTimes(1);
    });
  });

  describe("setVideoElement()", () => {
    it("sets the video element used for frame capture", async () => {
      const video = { videoWidth: 640, videoHeight: 480 };
      controller.setVideoElement(video);
      await controller.start();
      controller.capture();

      expect(adapter.captureFrame).toHaveBeenCalledWith(video, expect.anything(), expect.anything());
    });
  });
});

import type { Page } from "@playwright/test";

/**
 * Injects a fake getUserMedia implementation that returns a static canvas stream.
 * Must be called BEFORE page.goto() since it uses addInitScript.
 */
export async function mockCamera(page: Page): Promise<void> {
  await page.context().grantPermissions(["camera"]);

  await page.addInitScript(() => {
    const canvas = Object.assign(document.createElement("canvas"), {
      width: 640,
      height: 480,
    });
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "#4a90d9";
    ctx.fillRect(0, 0, 640, 480);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(320, 200, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4a90d9";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Mock Selfie", 320, 350);

    const stream = canvas.captureStream(30);

    navigator.mediaDevices.getUserMedia = async () => stream;

    navigator.mediaDevices.enumerateDevices = async () => [
      {
        deviceId: "mock-camera",
        groupId: "mock-group",
        kind: "videoinput" as MediaDeviceKind,
        label: "Mock Camera",
        toJSON: () => ({}),
      },
    ];
  });
}

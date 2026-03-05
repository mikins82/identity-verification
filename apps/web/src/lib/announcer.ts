let liveRegion: HTMLElement | null = null;

function getOrCreateLiveRegion(): HTMLElement {
  if (liveRegion && document.body.contains(liveRegion)) return liveRegion;

  liveRegion = document.createElement("div");
  liveRegion.setAttribute("role", "status");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  Object.assign(liveRegion.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0",
  });
  document.body.appendChild(liveRegion);
  return liveRegion;
}

export function announce(message: string): void {
  const region = getOrCreateLiveRegion();
  region.textContent = "";
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

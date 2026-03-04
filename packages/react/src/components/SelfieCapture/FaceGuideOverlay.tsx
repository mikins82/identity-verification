import type { CSSProperties } from "react";

interface FaceGuideOverlayProps {
  shape?: "oval" | "rectangle";
}

const overlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};

export function FaceGuideOverlay({ shape = "oval" }: FaceGuideOverlayProps) {
  return (
    <svg
      style={overlayStyle}
      viewBox="0 0 480 360"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <mask id="iv-face-guide-mask">
          <rect width="480" height="360" fill="white" />
          {shape === "oval" ? (
            <ellipse cx="240" cy="160" rx="110" ry="140" fill="black" />
          ) : (
            <rect x="130" y="40" width="220" height="260" rx="16" fill="black" />
          )}
        </mask>
      </defs>
      <rect width="480" height="360" fill="rgba(0,0,0,0.4)" mask="url(#iv-face-guide-mask)" />
      {shape === "oval" ? (
        <ellipse
          cx="240"
          cy="160"
          rx="110"
          ry="140"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity="0.8"
        />
      ) : (
        <rect
          x="130"
          y="40"
          width="220"
          height="260"
          rx="16"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeDasharray="8 4"
          opacity="0.8"
        />
      )}
    </svg>
  );
}

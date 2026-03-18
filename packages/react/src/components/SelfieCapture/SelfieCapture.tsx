import { useCallback, useEffect } from "react";
import { useCamera, type CameraError } from "../../hooks/useCamera";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import { FaceGuideOverlay } from "./FaceGuideOverlay";
import styles from "./SelfieCapture.module.css";

export interface SelfieCaptureProps {
  onCapture: (base64: string) => void;
  facingMode?: "user" | "environment";
  imageQuality?: number;
  guideShape?: "oval" | "rectangle";
  className?: string;
  onError?: (error: CameraError) => void;
}

export function SelfieCapture({
  onCapture,
  facingMode = "user",
  imageQuality = 0.8,
  guideShape = "oval",
  className,
  onError,
}: SelfieCaptureProps) {
  const { videoRef, state, capture, retake, retry } = useCamera({ facingMode, imageQuality });
  const stableOnError = useCallbackRef(onError ?? (() => {}));

  useEffect(() => {
    if (state.status === "error" && onError) {
      stableOnError(state.error);
    }
  }, [state, onError, stableOnError]);

  const handleCapture = useCallback(() => {
    capture();
  }, [capture]);

  const handleAccept = useCallback(() => {
    if (state.status === "preview") {
      onCapture(state.imageData);
    }
  }, [state, onCapture]);

  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      {(state.status === "initializing" || state.status === "permission-prompt") && (
        <div className={styles.loading} role="status">
          <div className={styles.spinner} />
          <p>
            {state.status === "initializing"
              ? "Initializing camera..."
              : "Waiting for camera permission..."}
          </p>
        </div>
      )}

      {state.status === "streaming" && (
        <>
          <div className={styles.viewfinder}>
            <video
              ref={videoRef}
              className={styles.video}
              autoPlay
              playsInline
              muted
              aria-label="Camera preview"
            />
            <FaceGuideOverlay shape={guideShape} />
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.captureButton}
              onClick={handleCapture}
              aria-label="Take photo"
            >
              <span className={styles.captureIcon} />
            </button>
          </div>
        </>
      )}

      {state.status === "preview" && (
        <div className={styles.preview}>
          <img src={state.imageData} alt="Captured selfie" className={styles.previewImage} />
          <div className={styles.previewActions}>
            <button type="button" className={styles.retakeButton} onClick={retake}>
              Retake
            </button>
            <button type="button" className={styles.acceptButton} onClick={handleAccept}>
              Use this photo
            </button>
          </div>
        </div>
      )}

      {state.status === "error" && (
        <div className={styles.error} role="alert">
          <p className={styles.errorTitle}>
            {state.error.type === "not-supported" && "Camera Not Available"}
            {(state.error.type === "permission-denied" || state.error.type === "permission-blocked") && "Camera Access Denied"}
            {state.error.type === "stream-error" && "Camera Error"}
          </p>
          <p className={styles.errorMessage}>{state.error.message}</p>
          {state.error.type !== "not-supported" && state.error.type !== "permission-blocked" && (
            <button type="button" className={styles.retryButton} onClick={retry}>
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

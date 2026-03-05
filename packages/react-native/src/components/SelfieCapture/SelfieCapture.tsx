import { useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useCamera, type CameraError } from "../../hooks/useCamera";
import { useCallbackRef } from "../../hooks/useCallbackRef";
import { useTheme, useNumericSpacing, useBorderRadius } from "../../theme/useTheme";
import { FaceGuideOverlay } from "./FaceGuideOverlay";

export interface SelfieCaptureProps {
  onCapture: (base64: string) => void;
  facingMode?: "user" | "environment";
  imageQuality?: number;
  guideShape?: "oval" | "rectangle";
  onError?: (error: CameraError) => void;
}

export function SelfieCapture({
  onCapture,
  facingMode = "user",
  imageQuality = 0.8,
  guideShape = "oval",
  onError,
}: SelfieCaptureProps) {
  const { CameraView, state, capture, retake, retry } = useCamera({ facingMode, imageQuality });
  const stableOnError = useCallbackRef(onError ?? (() => {}));
  const theme = useTheme();
  const spacing = useNumericSpacing();
  const borderRadius = useBorderRadius();

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

  if (state.status === "initializing" || state.status === "permission-prompt") {
    return (
      <View style={[styles.center, { padding: spacing.lg }]} accessibilityRole="progressbar">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: theme.colors.textSecondary, fontFamily: theme.fontFamily, marginTop: spacing.md },
          ]}
        >
          {state.status === "initializing"
            ? "Initializing camera..."
            : "Waiting for camera permission..."}
        </Text>
      </View>
    );
  }

  if (state.status === "streaming") {
    return (
      <View style={styles.container}>
        <View style={[styles.viewfinder, { borderRadius }]}>
          {CameraView}
          <FaceGuideOverlay shape={guideShape} />
        </View>
        <View style={[styles.actions, { marginTop: spacing.md }]}>
          <Pressable
            onPress={handleCapture}
            style={[styles.captureButton, { borderColor: theme.colors.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
          >
            <View style={[styles.captureInner, { backgroundColor: theme.colors.primary }]} />
          </Pressable>
        </View>
      </View>
    );
  }

  if (state.status === "preview") {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: state.imageData }}
          style={[styles.previewImage, { borderRadius }]}
          accessibilityLabel="Captured selfie"
        />
        <View style={[styles.previewActions, { marginTop: spacing.md, gap: spacing.sm }]}>
          <Pressable
            onPress={retake}
            style={[
              styles.secondaryButton,
              { borderColor: theme.colors.border, borderRadius, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
            ]}
            accessibilityRole="button"
          >
            <Text style={{ color: theme.colors.text, fontFamily: theme.fontFamily }}>
              Retake
            </Text>
          </Pressable>
          <Pressable
            onPress={handleAccept}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary, borderRadius, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
            ]}
            accessibilityRole="button"
          >
            <Text style={{ color: "#ffffff", fontFamily: theme.fontFamily, fontWeight: "600" }}>
              Use this photo
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (state.status === "error") {
    return (
      <View style={[styles.center, { padding: spacing.lg }]} accessibilityRole="alert">
        <Text
          style={[styles.errorTitle, { color: theme.colors.error, fontFamily: theme.fontFamily }]}
        >
          {state.error.type === "not-supported" && "Camera Not Available"}
          {state.error.type === "permission-denied" && "Camera Access Denied"}
          {state.error.type === "stream-error" && "Camera Error"}
        </Text>
        <Text
          style={[
            styles.errorMessage,
            { color: theme.colors.textSecondary, fontFamily: theme.fontFamily, marginTop: spacing.sm },
          ]}
        >
          {state.error.message}
        </Text>
        {state.error.type !== "not-supported" && (
          <Pressable
            onPress={retry}
            style={[
              styles.primaryButton,
              { backgroundColor: theme.colors.primary, borderRadius, marginTop: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
            ]}
            accessibilityRole="button"
          >
            <Text style={{ color: "#ffffff", fontFamily: theme.fontFamily, fontWeight: "600" }}>
              Try Again
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    textAlign: "center",
  },
  viewfinder: {
    width: "100%",
    aspectRatio: 3 / 4,
    overflow: "hidden",
    position: "relative",
  },
  actions: {
    alignItems: "center",
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  previewImage: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButton: {
    borderWidth: 1,
    alignItems: "center",
  },
  primaryButton: {
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 14,
    textAlign: "center",
  },
});

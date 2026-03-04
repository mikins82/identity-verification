import { View, StyleSheet } from "react-native";

interface FaceGuideOverlayProps {
  shape?: "oval" | "rectangle";
}

export function FaceGuideOverlay({ shape = "oval" }: FaceGuideOverlayProps) {
  return (
    <View style={styles.overlay} pointerEvents="none">
      <View style={styles.mask}>
        <View style={styles.topFill} />
        <View style={styles.middleRow}>
          <View style={styles.sideFill} />
          <View
            style={[
              styles.cutout,
              shape === "oval"
                ? styles.cutoutOval
                : styles.cutoutRect,
            ]}
          />
          <View style={styles.sideFill} />
        </View>
        <View style={styles.bottomFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mask: {
    flex: 1,
  },
  topFill: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  middleRow: {
    flexDirection: "row",
    height: 280,
  },
  sideFill: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  cutout: {
    width: 220,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderStyle: "dashed",
  },
  cutoutOval: {
    borderRadius: 110,
  },
  cutoutRect: {
    borderRadius: 16,
  },
  bottomFill: {
    flex: 1.4,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
});

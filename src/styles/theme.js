import { StyleSheet } from "react-native";

export const lightColors = {
  bg: "#ffffff",
  bgSoft: "#f7fbff",
  bgMuted: "#f7f9fc",
  card: "#ffffff",
  cardElevated: "#f3f7ff",
  cardMuted: "#f5f7fb",
  border: "#e6ebf3",
  borderSoft: "#edf2fb",
  accent: "#8cabff",
  accentSoft: "#6f8fe4",
  textPrimary: "#12161c",
  textSecondary: "#4e5868",
  textMuted: "#8a94a6",
  textStrong: "#101318",
  danger: "#f26a5f",
  tabBg: "rgba(255,255,255,0.98)",
  overlayCard: "rgba(255,255,255,0.76)",
};

export const darkColors = {
  bg: "#000000",
  bgSoft: "#000000",
  bgMuted: "#050505",
  card: "#0a0a0a",
  cardElevated: "#101010",
  cardMuted: "#141414",
  border: "#1f1f1f",
  borderSoft: "#141414",
  accent: "#8ba7ff",
  accentSoft: "#b2c3ff",
  textPrimary: "#f4f7fd",
  textSecondary: "#b2bfd2",
  textMuted: "#748196",
  textStrong: "#fbfdff",
  danger: "#ff8b7f",
  tabBg: "rgba(0,0,0,0.98)",
  overlayCard: "rgba(10,10,10,0.94)",
};

export function getTheme(mode = "light") {
  return mode === "dark" ? darkColors : lightColors;
}

export function createScreenStyles(colors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.bgSoft,
    },
    container: {
      flex: 1,
      backgroundColor: colors.bgSoft,
    },
    screenContent: {
      padding: 16,
      paddingTop: 10,
      paddingBottom: 112,
      gap: 12,
    },
    panel: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      minHeight: 48,
      borderRadius: 14,
      backgroundColor: colors.cardMuted,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.textPrimary,
      fontSize: 14,
    },
  });
}

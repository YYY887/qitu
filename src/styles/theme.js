import { StyleSheet } from "react-native";

export const colors = {
  bg: "#ffffff",
  bgSoft: "#f7f9fc",
  card: "#ffffff",
  cardElevated: "#f3f7ff",
  cardMuted: "#f5f7fb",
  border: "#e6ebf3",
  accent: "#8cabff",
  accentSoft: "#6f8fe4",
  textPrimary: "#12161c",
  textSecondary: "#4e5868",
  textMuted: "#8a94a6",
  danger: "#f26a5f",
};

export const screenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7fbff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f7fbff",
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

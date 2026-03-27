import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createScreenStyles, getTheme } from "../styles/theme";

export default function ProfileScreen({
  activeSourceName,
  historyCount = 0,
  favoritesCount = 0,
  themeMode = "light",
  colors: themeColors,
  onToggleThemeMode,
  onOpenHistory,
  onOpenFavorites,
}) {
  const colors = themeColors || getTheme(themeMode);
  const screenStyles = createScreenStyles(colors);

  return (
    <ScrollView contentContainerStyle={[styles.content, screenStyles.screenContent, { backgroundColor: colors.bgSoft }]} showsVerticalScrollIndicator={false}>
      <View style={styles.heroRow}>
        <Image source={require("../../assets/icon.png")} style={styles.avatar} />
        <View style={styles.heroText}>
          <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>歧途</Text>
          <Text style={[styles.heroDesc, { color: colors.textMuted }]} numberOfLines={1}>
            {activeSourceName || "当前源"}
          </Text>
        </View>
      </View>

      <View style={[styles.menuGroup, { backgroundColor: colors.overlayCard, borderColor: colors.border }]}>
        <Pressable style={[styles.menuItem, { borderBottomColor: colors.borderSoft }]} onPress={onOpenHistory}>
          <View>
            <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>播放记录</Text>
            <Text style={[styles.menuMeta, { color: colors.textMuted }]}>共 {historyCount} 条，保留到具体集数</Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
        </Pressable>

        <Pressable style={[styles.menuItem, { borderBottomColor: colors.borderSoft }]} onPress={onOpenFavorites}>
          <View>
            <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>收藏记录</Text>
            <Text style={[styles.menuMeta, { color: colors.textMuted }]}>共 {favoritesCount} 条</Text>
          </View>
          <Text style={[styles.menuArrow, { color: colors.textMuted }]}>›</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={onToggleThemeMode}>
          <View>
            <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>夜间模式</Text>
            <Text style={[styles.menuMeta, { color: colors.textMuted }]}>
              {themeMode === "dark" ? "当前已开启" : "当前已关闭"}
            </Text>
          </View>
          <View style={[styles.modeSwitch, themeMode === "dark" && styles.modeSwitchActive, { backgroundColor: themeMode === "dark" ? colors.accent : colors.cardMuted }]}>
            <View style={[styles.modeThumb, themeMode === "dark" && styles.modeThumbActive, { backgroundColor: themeMode === "dark" ? "#ffffff" : colors.textMuted }]} />
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingBottom: 10,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
  },
  heroDesc: {
    marginTop: 4,
    fontSize: 13,
  },
  menuGroup: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  menuMeta: {
    marginTop: 4,
    fontSize: 12,
  },
  menuArrow: {
    fontSize: 20,
    lineHeight: 20,
  },
  modeSwitch: {
    width: 44,
    height: 26,
    borderRadius: 999,
    padding: 3,
    justifyContent: "center",
  },
  modeSwitchActive: {
    alignItems: "flex-end",
  },
  modeThumb: {
    width: 20,
    height: 20,
    borderRadius: 999,
  },
  modeThumbActive: {},
});

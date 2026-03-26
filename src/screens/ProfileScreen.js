import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, screenStyles } from "../styles/theme";

export default function ProfileScreen({
  activeSourceName,
  historyCount = 0,
  favoritesCount = 0,
  onOpenHistory,
  onOpenFavorites,
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroRow}>
        <Image source={require("../../assets/icon.png")} style={styles.avatar} />
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>歧途</Text>
          <Text style={styles.heroDesc} numberOfLines={1}>
            {activeSourceName || "当前源"}
          </Text>
        </View>
      </View>

      <View style={styles.menuGroup}>
        <Pressable style={styles.menuItem} onPress={onOpenHistory}>
          <View>
            <Text style={styles.menuTitle}>播放记录</Text>
            <Text style={styles.menuMeta}>共 {historyCount} 条，保留到具体集数</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={onOpenFavorites}>
          <View>
            <Text style={styles.menuTitle}>收藏记录</Text>
            <Text style={styles.menuMeta}>共 {favoritesCount} 条</Text>
          </View>
          <Text style={styles.menuArrow}>›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    ...screenStyles.screenContent,
    paddingTop: 12,
    backgroundColor: "#f7fbff",
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
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
  },
  heroDesc: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
  },
  menuGroup: {
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2eaf8",
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
    borderBottomColor: "#edf2fb",
  },
  menuTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  menuMeta: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
  },
  menuArrow: {
    color: "#8a94a6",
    fontSize: 20,
    lineHeight: 20,
  },
});

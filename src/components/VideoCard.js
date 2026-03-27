import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { getTheme } from "../styles/theme";

export default function VideoCard({ item, loading, onPress, colors: themeColors }) {
  const colors = themeColors || getTheme("light");

  return (
    <Pressable style={styles.card} onPress={() => onPress(item)}>
      <View style={styles.posterWrap}>
        {item.pic ? (
          <Image source={{ uri: item.pic }} style={styles.poster} resizeMode="cover" />
        ) : (
          <View style={styles.posterFallback}>
            <Text style={styles.posterFallbackText}>NO COVER</Text>
          </View>
        )}
        {item.remarks ? (
          <View style={styles.badgeWrap}>
            <Text style={styles.badge} numberOfLines={1}>
              {item.remarks}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.textStrong }]} numberOfLines={1}>
          {item.name}
        </Text>
        {loading ? <Text style={[styles.hint, { color: colors.textMuted }]}>加载中...</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    flex: 1,
  },
  posterWrap: {
    position: "relative",
    aspectRatio: 0.7,
    backgroundColor: "#d8d8d8",
    borderRadius: 14,
    overflow: "hidden",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#d8d8d8",
  },
  posterFallbackText: {
    color: "#8d95a3",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  badgeWrap: {
    position: "absolute",
    right: 6,
    top: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#ffab21",
  },
  badge: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "800",
  },
  body: {
    paddingTop: 7,
    paddingHorizontal: 1,
    minHeight: 30,
  },
  title: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
  },
  hint: {
    marginTop: 4,
    fontSize: 10,
  },
});

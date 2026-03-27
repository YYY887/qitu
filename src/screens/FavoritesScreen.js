import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createScreenStyles, getTheme } from "../styles/theme";

export default function FavoritesScreen({ favorites = [], colors: themeColors, onBack, onOpenVideo, onRemoveFavorite }) {
  const colors = themeColors || getTheme("light");
  const screenStyles = createScreenStyles(colors);

  return (
    <ScrollView contentContainerStyle={[styles.content, screenStyles.screenContent, { backgroundColor: colors.bgSoft }]} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={[styles.backText, { color: colors.textPrimary }]}>‹ 返回</Text>
      </Pressable>

      {favorites.length ? (
        favorites.map((item) => (
          <View key={item.id} style={[styles.favoriteItem, { backgroundColor: colors.overlayCard, borderColor: colors.border }]}>
            <Pressable style={styles.favoriteMain} onPress={() => onOpenVideo?.(item)}>
              {item.pic ? <Image source={{ uri: item.pic }} style={styles.poster} /> : <View style={styles.posterFallback} />}
              <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]} numberOfLines={1}>
                  {item.year || "--"} / {item.area || "未知地区"} / {item.typeName || "未分类"}
                </Text>
              </View>
            </Pressable>
            <Pressable hitSlop={10} onPress={() => onRemoveFavorite?.(item)}>
              <Text style={[styles.removeText, { color: colors.textMuted }]}>取消收藏</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>还没有收藏记录</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: "700",
  },
  favoriteItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
  },
  favoriteMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  poster: {
    width: 52,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#eef2f8",
  },
  posterFallback: {
    width: 52,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#eef2f8",
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  itemMeta: {
    marginTop: 6,
    fontSize: 12,
  },
  removeText: {
    fontSize: 12,
  },
  emptyWrap: {
    paddingVertical: 18,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
});

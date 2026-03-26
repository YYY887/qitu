import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, screenStyles } from "../styles/theme";

export default function FavoritesScreen({ favorites = [], onBack, onOpenVideo, onRemoveFavorite }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>‹ 返回</Text>
      </Pressable>

      {favorites.length ? (
        favorites.map((item) => (
          <View key={item.id} style={styles.favoriteItem}>
            <Pressable style={styles.favoriteMain} onPress={() => onOpenVideo?.(item)}>
              {item.pic ? <Image source={{ uri: item.pic }} style={styles.poster} /> : <View style={styles.posterFallback} />}
              <View style={styles.itemText}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {item.year || "--"} / {item.area || "未知地区"} / {item.typeName || "未分类"}
                </Text>
              </View>
            </Pressable>
            <Pressable hitSlop={10} onPress={() => onRemoveFavorite?.(item)}>
              <Text style={styles.removeText}>取消收藏</Text>
            </Pressable>
          </View>
        ))
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>还没有收藏记录</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    ...screenStyles.screenContent,
    paddingTop: 12,
    backgroundColor: "#f7fbff",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backText: {
    color: colors.textPrimary,
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
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "#e2eaf8",
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
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  itemMeta: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
  },
  removeText: {
    color: "#9aa3b1",
    fontSize: 12,
  },
  emptyWrap: {
    paddingVertical: 18,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});

import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createScreenStyles, getTheme } from "../styles/theme";

export default function HistoryScreen({ history = [], colors: themeColors, onBack, onOpenHistory }) {
  const colors = themeColors || getTheme("light");
  const screenStyles = createScreenStyles(colors);

  return (
    <ScrollView contentContainerStyle={[styles.content, screenStyles.screenContent, { backgroundColor: colors.bgSoft }]} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={[styles.backText, { color: colors.textPrimary }]}>‹ 返回</Text>
      </Pressable>

      {history.length ? (
        history.map((item) => (
          <Pressable
            key={item.historyId || item.id}
            style={[styles.listItem, { backgroundColor: colors.overlayCard, borderColor: colors.border }]}
            onPress={() => onOpenHistory?.(item)}
          >
            {item.pic ? <Image source={{ uri: item.pic }} style={styles.poster} /> : <View style={styles.posterFallback} />}
            <View style={styles.itemText}>
              <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.itemMeta, { color: colors.textMuted }]} numberOfLines={1}>
                播放到 {item.episodeName || "未知集数"}
              </Text>
            </View>
            <Text style={[styles.itemArrow, { color: colors.textMuted }]}>›</Text>
          </Pressable>
        ))
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>还没有播放记录</Text>
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
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
  itemArrow: {
    fontSize: 20,
    lineHeight: 20,
  },
  emptyWrap: {
    paddingVertical: 18,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
});

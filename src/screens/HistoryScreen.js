import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, screenStyles } from "../styles/theme";

export default function HistoryScreen({ history = [], onBack, onOpenHistory }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backText}>‹ 返回</Text>
      </Pressable>

      {history.length ? (
        history.map((item) => (
          <Pressable key={item.historyId || item.id} style={styles.listItem} onPress={() => onOpenHistory?.(item)}>
            {item.pic ? <Image source={{ uri: item.pic }} style={styles.poster} /> : <View style={styles.posterFallback} />}
            <View style={styles.itemText}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemMeta} numberOfLines={1}>
                播放到 {item.episodeName || "未知集数"}
              </Text>
            </View>
            <Text style={styles.itemArrow}>›</Text>
          </Pressable>
        ))
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>还没有播放记录</Text>
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "#e2eaf8",
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
  itemArrow: {
    color: "#8a94a6",
    fontSize: 20,
    lineHeight: 20,
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

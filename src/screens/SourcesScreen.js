import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createScreenStyles, getTheme } from "../styles/theme";

export default function SourcesScreen({
  siteName,
  sourceUrl,
  format,
  error,
  savedSources,
  colors: themeColors,
  onApplySaved,
  onDeleteSaved,
  onEditNote,
  onOpenAdd,
}) {
  const colors = themeColors || getTheme("light");
  const screenStyles = createScreenStyles(colors);
  return (
    <ScrollView contentContainerStyle={[styles.content, screenStyles.screenContent, { backgroundColor: colors.bgSoft }]} showsVerticalScrollIndicator={false}>
      <View style={styles.currentRow}>
        <Text style={[styles.currentLabel, { color: colors.textMuted }]}>当前使用</Text>
        <Text style={[styles.currentName, { color: colors.textPrimary }]} numberOfLines={1}>
          {siteName || "未加载"}
        </Text>
        <Text style={[styles.currentUrl, { color: colors.textMuted }]} numberOfLines={2}>
          {sourceUrl}
        </Text>
        <Text style={[styles.currentMeta, { color: colors.accent }]}>{format ? format.toUpperCase() : "--"}</Text>
      </View>

      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.textPrimary }]}>我的源</Text>
        <View style={styles.headerActions}>
          <Pressable
            hitSlop={10}
            onPress={() => {
              Alert.alert("导入提示", "支持 CMS 的源均可导入");
            }}
          >
            <Text style={[styles.tipText, { color: colors.accentSoft }]}>提示</Text>
          </Pressable>
          <Text style={[styles.listDesc, { color: colors.textMuted }]}>右上角加号新增</Text>
        </View>
      </View>

      {savedSources.map((item) => {
        const active = item.url === sourceUrl;

        return (
          <Pressable key={item.id} style={[styles.item, { borderBottomColor: colors.border }]} onPress={() => onApplySaved(item)}>
            <View style={styles.itemMain}>
              <View style={[styles.dot, { backgroundColor: colors.textSecondary }, active && styles.dotActive, active && { backgroundColor: colors.accent }]} />
              <View style={styles.itemText}>
                <View style={styles.titleRow}>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {active ? (
                    <View style={styles.activeTag}>
                      <Text style={[styles.activeTagText, { color: colors.accent }]}>当前</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.itemUrl, { color: colors.textMuted }]} numberOfLines={2}>
                  {item.url}
                </Text>
                {item.note ? (
                  <Text style={[styles.itemNote, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.note}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.itemActions}>
              <Pressable
                hitSlop={10}
                onPress={(event) => {
                  event.stopPropagation?.();
                  onEditNote?.(item);
                }}
              >
                <Text style={[styles.editText, { color: colors.accentSoft }]}>备注</Text>
              </Pressable>
              <Pressable
                hitSlop={10}
                onPress={(event) => {
                  event.stopPropagation?.();
                  onDeleteSaved(item);
                }}
              >
                <Text style={[styles.deleteText, { color: colors.textMuted }]}>删除</Text>
              </Pressable>
            </View>
          </Pressable>
        );
      })}

      {!savedSources.length ? (
        <Pressable style={styles.emptyWrap} onPress={onOpenAdd}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>还没有保存的源</Text>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>点右上角加号添加</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    gap: 10,
  },
  currentRow: {
    paddingHorizontal: 2,
    paddingBottom: 10,
  },
  currentLabel: {
    fontSize: 11,
  },
  currentName: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: "800",
  },
  currentUrl: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
  },
  currentMeta: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 12,
    lineHeight: 18,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  tipText: { fontSize: 12, fontWeight: "600" },
  listDesc: {
    fontSize: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 999, marginTop: 7 },
  dotActive: {},
  itemText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  activeTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(216, 179, 106, 0.18)",
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  itemUrl: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  itemNote: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  itemActions: {
    alignItems: "flex-end",
    gap: 10,
  },
  editText: { fontSize: 12 },
  deleteText: { fontSize: 12 },
  emptyWrap: {
    paddingVertical: 36,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 12,
  },
});

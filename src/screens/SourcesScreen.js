import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, screenStyles } from "../styles/theme";

export default function SourcesScreen({
  siteName,
  sourceUrl,
  format,
  error,
  savedSources,
  onApplySaved,
  onDeleteSaved,
  onEditNote,
  onOpenAdd,
}) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.currentRow}>
        <Text style={styles.currentLabel}>当前使用</Text>
        <Text style={styles.currentName} numberOfLines={1}>
          {siteName || "未加载"}
        </Text>
        <Text style={styles.currentUrl} numberOfLines={2}>
          {sourceUrl}
        </Text>
        <Text style={styles.currentMeta}>{format ? format.toUpperCase() : "--"}</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>我的源</Text>
        <View style={styles.headerActions}>
          <Pressable
            hitSlop={10}
            onPress={() => {
              Alert.alert("导入提示", "支持 CMS 的源均可导入");
            }}
          >
            <Text style={styles.tipText}>提示</Text>
          </Pressable>
          <Text style={styles.listDesc}>右上角加号新增</Text>
        </View>
      </View>

      {savedSources.map((item) => {
        const active = item.url === sourceUrl;

        return (
          <Pressable key={item.id} style={styles.item} onPress={() => onApplySaved(item)}>
            <View style={styles.itemMain}>
              <View style={[styles.dot, active && styles.dotActive]} />
              <View style={styles.itemText}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {active ? (
                    <View style={styles.activeTag}>
                      <Text style={styles.activeTagText}>当前</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.itemUrl} numberOfLines={2}>
                  {item.url}
                </Text>
                {item.note ? (
                  <Text style={styles.itemNote} numberOfLines={2}>
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
                <Text style={styles.editText}>备注</Text>
              </Pressable>
              <Pressable
                hitSlop={10}
                onPress={(event) => {
                  event.stopPropagation?.();
                  onDeleteSaved(item);
                }}
              >
                <Text style={styles.deleteText}>删除</Text>
              </Pressable>
            </View>
          </Pressable>
        );
      })}

      {!savedSources.length ? (
        <Pressable style={styles.emptyWrap} onPress={onOpenAdd}>
          <Text style={styles.emptyTitle}>还没有保存的源</Text>
          <Text style={styles.emptyText}>点右上角加号添加</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    ...screenStyles.screenContent,
    paddingTop: 8,
    gap: 10,
    backgroundColor: "#f7fbff",
  },
  currentRow: {
    paddingHorizontal: 2,
    paddingBottom: 10,
  },
  currentLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  currentName: {
    marginTop: 6,
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "800",
  },
  currentUrl: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  currentMeta: {
    marginTop: 8,
    color: colors.accent,
    fontSize: 11,
    fontWeight: "700",
  },
  errorText: {
    color: colors.danger,
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
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "800",
  },
  tipText: {
    color: "#6c88c8",
    fontSize: 12,
    fontWeight: "600",
  },
  listDesc: {
    color: colors.textMuted,
    fontSize: 12,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#4f5663",
    marginTop: 7,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
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
    color: colors.textPrimary,
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
    color: colors.accent,
    fontSize: 10,
    fontWeight: "700",
  },
  itemUrl: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  itemNote: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  itemActions: {
    alignItems: "flex-end",
    gap: 10,
  },
  editText: {
    color: "#6c88c8",
    fontSize: 12,
  },
  deleteText: {
    color: "#9aa3b1",
    fontSize: 12,
  },
  emptyWrap: {
    paddingVertical: 36,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  emptyText: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
  },
});

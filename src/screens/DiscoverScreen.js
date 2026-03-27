import React, { useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import VideoCard from "../components/VideoCard";
import { getTheme } from "../styles/theme";

export default function DiscoverScreen({
  categories = [],
  selectedCategory,
  keyword,
  setKeyword,
  page,
  pageCount,
  total,
  videos = [],
  loading,
  loadingMore,
  detailLoadingId,
  colors: themeColors,
  onOpenVideo,
  onSearch,
  onClear,
  onSelectCategory,
  onLoadMore,
}) {
  const colors = themeColors || getTheme("light");
  const listRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [showToTop, setShowToTop] = useState(false);

  return (
    <View style={[styles.page, { backgroundColor: colors.bgSoft }]}>
      <FlatList
        ref={listRef}
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={3}
        columnWrapperStyle={styles.columnWrap}
        onScroll={(event) => {
          setShowToTop(event.nativeEvent.contentOffset.y > 260);
        }}
        scrollEventThrottle={16}
        onEndReached={() => {
          if (!loading && !loadingMore && page < pageCount) {
            onLoadMore();
          }
        }}
        onEndReachedThreshold={0.35}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {loading ? (
              <View pointerEvents="none" style={styles.searchingFloat}>
                <ActivityIndicator size="small" color={colors.accentSoft} />
                <Text style={styles.searchingFloatText}>搜索中</Text>
              </View>
            ) : null}
            <View style={styles.searchRow}>
              <View style={styles.searchInputWrap}>
                <TextInput
                  value={keyword}
                  onChangeText={setKeyword}
                  placeholder="搜索片名 / 演员 / 导演..."
                  placeholderTextColor={colors.textMuted}
                  style={[styles.compactInput, { color: colors.textPrimary }]}
                  returnKeyType="search"
                  onSubmitEditing={onSearch}
                />
                {keyword?.length > 0 && (
                  <Pressable style={styles.clearIcon} onPress={onClear}>
                    <Text style={[styles.clearIconText, { color: colors.textSecondary }]}>✕</Text>
                  </Pressable>
                )}
              </View>
              <Pressable style={[styles.compactSearchBtn, { backgroundColor: colors.overlayCard, borderColor: colors.border }]} onPress={onSearch}>
                <Text style={[styles.compactSearchBtnText, { color: colors.textPrimary }]}>搜索</Text>
              </Pressable>
            </View>

            <View style={styles.categorySection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {categories.map((item) => {
                  const active = item.id === selectedCategory;
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.miniChip, active && styles.miniChipActive, active && { borderBottomColor: colors.textPrimary }]}
                      onPress={() => onSelectCategory(item.id)}
                    >
                      <Text style={[styles.miniChipText, { color: active ? colors.textPrimary : colors.textPrimary }, active && styles.miniChipTextActive]}>
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.resultInfoRow}>
                <Text style={[styles.resultText, { color: colors.textMuted }]}>{total} 条内容</Text>
                <Text style={[styles.resultText, { color: colors.textMuted }]}>{page} / {pageCount}</Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardCell}>
            <VideoCard item={item} loading={detailLoadingId === item.id} onPress={onOpenVideo} colors={colors} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>没有找到相关内容</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>换个分类、关键词再试一下吧</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.loadingMoreWrap}>
              <ActivityIndicator color={colors.textMuted} />
              <Text style={[styles.loadingMoreText, { color: colors.textMuted }]}>加载中...</Text>
            </View>
          ) : page < pageCount ? (
            <View style={styles.footerSpace} />
          ) : (
            <View style={styles.footerEnd} />
          )
        }
      />

      {showToTop ? (
        <Pressable
          style={[styles.toTopButton, { bottom: 58 + Math.max(insets.bottom, 8), backgroundColor: colors.overlayCard, borderColor: colors.border }]}
          onPress={() => listRef.current?.scrollToOffset?.({ offset: 0, animated: true })}
        >
          <Text style={[styles.toTopText, { color: colors.accentSoft }]}>↑</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  listContent: {
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 96,
  },
  headerContainer: {
    paddingBottom: 10,
    paddingTop: 4,
    backgroundColor: "transparent",
    borderRadius: 22,
    paddingHorizontal: 10,
    marginHorizontal: -2,
  },
  columnWrap: {
    gap: 8,
  },
  cardCell: {
    flex: 1,
    marginTop: 12,
    maxWidth: "33.3333%",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#dce7f7",
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 44,
  },
  compactInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    paddingVertical: 0,
  },
  clearIcon: {
    padding: 4,
    backgroundColor: "#edf0f5",
    borderRadius: 12,
    marginLeft: 6,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIconText: {
    fontSize: 10,
    fontWeight: "bold",
    lineHeight: 12,
  },
  compactSearchBtn: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "#dce7f7",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  compactSearchBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  categorySection: {
    marginBottom: 6,
  },
  searchingFloat: {
    position: "absolute",
    right: 10,
    top: 6,
    zIndex: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#dbe7fb",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  searchingFloatText: {
    fontSize: 11,
    fontWeight: "600",
  },
  categoryRow: {
    gap: 20,
    paddingBottom: 6,
  },
  miniChip: {
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  miniChipActive: {
    borderBottomWidth: 4,
    borderBottomColor: "#111111",
  },
  miniChipText: {
    fontSize: 16,
    fontWeight: "500",
  },
  miniChipTextActive: {
    fontWeight: "700",
  },
  resultInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  resultText: {
    fontSize: 11,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 12,
  },
  loadingMoreWrap: {
    height: 40,
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 12,
  },
  footerSpace: {
    height: 20,
  },
  footerEnd: {
    height: 20,
  },
  toTopButton: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#dce7f7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#a8b9d6",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  toTopText: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 18,
  },
});

import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import DramaPlayer from "../components/DramaPlayer";
import { splitPlaySources } from "../lib/cms";
import { getTheme } from "../styles/theme";

function usePlayableUrl(rawUrl) {
  return useMemo(() => {
    if (!rawUrl) {
      return "";
    }

    if (rawUrl.startsWith("//")) {
      return `https:${rawUrl}`;
    }

    return rawUrl;
  }, [rawUrl]);
}

export default function DetailScreen({
  video,
  episode,
  detailLoadingId,
  isFavorite,
  colors: themeColors,
  onToggleFavorite,
  onTrackHistory,
  onBack,
  onEpisodePick,
}) {
  const colors = themeColors || getTheme("light");
  const groups = useMemo(
    () => splitPlaySources(video?.playFrom || "", video?.playUrl || ""),
    [video]
  );
  const [episodePageMap, setEpisodePageMap] = useState({});
  const playableUrl = usePlayableUrl(episode?.url || "");
  const flatEpisodes = useMemo(() => groups.flatMap((group) => group.episodes), [groups]);
  const nextEpisode = useMemo(() => {
    if (!episode?.url) {
      return flatEpisodes[0] || null;
    }

    const currentIndex = flatEpisodes.findIndex((item) => item.url === episode.url);
    if (currentIndex < 0) {
      return flatEpisodes[0] || null;
    }

    return flatEpisodes[currentIndex + 1] || null;
  }, [episode?.url, flatEpisodes]);

  useEffect(() => {
    if (!video?.id || !episode?.url) {
      return;
    }

    onTrackHistory?.(video, episode);
  }, [video?.id, episode?.url, onTrackHistory]);

  useEffect(() => {
    setEpisodePageMap({});
  }, [video?.id]);

  return (
    <View style={[styles.pageWrap, { backgroundColor: colors.bgSoft }]}>
      <ScrollView style={[styles.page, { backgroundColor: colors.bgSoft }]} contentContainerStyle={styles.container}>
        <View style={styles.playerCard}>
          <DramaPlayer
            source={playableUrl}
            title={video?.name || "详情"}
            onBack={onBack}
            onNextEpisode={() => nextEpisode && onEpisodePick(nextEpisode)}
            nextEpisodeLabel={nextEpisode ? "下一集" : "最后一集"}
          />
        </View>

        <View style={[styles.panelTabs, { backgroundColor: colors.bgSoft, borderBottomColor: colors.borderSoft }]}>
          <Text style={[styles.panelTabText, styles.panelTabTextActive, { color: colors.textPrimary }]}>视频</Text>
        </View>

        <View style={[styles.panelBody, { backgroundColor: colors.bgSoft, borderBottomColor: colors.borderSoft }]}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{video?.name || "视频详情"}</Text>
            <View style={styles.titleActions}>
              <Pressable style={styles.favoriteButton} onPress={() => onToggleFavorite?.(video)}>
                <Text
                  style={[
                    styles.favoriteButtonText,
                    { color: colors.textMuted },
                    isFavorite && styles.favoriteButtonTextActive,
                    isFavorite && { color: colors.accent },
                  ]}
                >
                  {isFavorite ? "已收藏" : "收藏"}
                </Text>
              </Pressable>
            </View>
          </View>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>
            {video?.year || "--"} / {video?.area || "未知地区"} / {video?.typeName || "未分类"}
          </Text>
        </View>

        <View style={[styles.panelBody, { backgroundColor: colors.bgSoft, borderBottomColor: colors.borderSoft }]}>
          <View style={styles.episodeHeader}>
            <Text style={[styles.episodeHeaderTitle, { color: colors.textPrimary }]}>选集</Text>
            <Text style={[styles.episodeHeaderMeta, { color: colors.textSecondary }]}>{video?.remarks || ""}</Text>
          </View>
          {groups.length ? (
            groups.map((group) => (
              <View key={group.id} style={styles.groupBlock}>
                <View style={[styles.sourceBar, { backgroundColor: colors.overlayCard, borderColor: colors.border }]}>
                  <Text style={[styles.sourceBarText, { color: colors.textPrimary }]}>
                    {group.name} {group.episodes.length} 个视频
                  </Text>
                  <Text style={[styles.sourceBarAction, { color: colors.accentSoft }]}>切换资源</Text>
                </View>
                {group.episodes.length > 50 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.pageRangeRow}
                  >
                    {Array.from({ length: Math.ceil(group.episodes.length / 50) }).map((_, pageIndex) => {
                      const start = pageIndex * 50 + 1;
                      const end = Math.min((pageIndex + 1) * 50, group.episodes.length);
                      const activePage =
                        episodePageMap[group.id] ??
                        Math.max(0, Math.floor(group.episodes.findIndex((item) => item.url === episode?.url) / 50));
                      const selected = activePage === pageIndex;

                      return (
                        <Pressable
                          key={`${group.id}-${start}-${end}`}
                          style={[
                            styles.pageRangeButton,
                            { backgroundColor: colors.overlayCard, borderColor: colors.border },
                            selected && styles.pageRangeButtonActive,
                            selected && { backgroundColor: colors.card, borderColor: colors.accent },
                          ]}
                          onPress={() =>
                            setEpisodePageMap((current) => ({
                              ...current,
                              [group.id]: pageIndex,
                            }))
                          }
                        >
                          <Text
                            style={[
                              styles.pageRangeText,
                              { color: colors.textMuted },
                              selected && styles.pageRangeTextActive,
                              selected && { color: colors.accentSoft },
                            ]}
                          >
                            {start}-{end}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : null}
                <View style={styles.episodeWrap}>
                  {group.episodes
                    .slice(
                      (episodePageMap[group.id] ??
                        Math.max(0, Math.floor(group.episodes.findIndex((item) => item.url === episode?.url) / 50))) * 50,
                      ((episodePageMap[group.id] ??
                        Math.max(0, Math.floor(group.episodes.findIndex((item) => item.url === episode?.url) / 50))) + 1) *
                        50
                    )
                    .map((item) => {
                    const active = item.url === episode?.url;

                    return (
                      <Pressable
                        key={item.id}
                        style={[
                          styles.episodeButton,
                          { backgroundColor: colors.overlayCard, borderColor: colors.border },
                          active && styles.episodeButtonActive,
                          active && { backgroundColor: colors.card, borderColor: colors.accent },
                        ]}
                        onPress={() => onEpisodePick(item)}
                      >
                        <Text
                          style={[
                            styles.episodeText,
                            { color: "#ffffff" },
                            active && styles.episodeTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                      </Pressable>
                    );
                    })}
                </View>
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.bgSoft }]}>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>暂无播放线路</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>这个源如果支持详情接口，再点一次通常会自动补全。</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: "#f7fbff",
  },
  page: {
    flex: 1,
    backgroundColor: "#f7fbff",
  },
  container: {
    paddingBottom: 32,
  },
  playerCard: {
    backgroundColor: "#000000",
  },
  panelTabs: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#f7fbff",
    borderBottomWidth: 1,
    borderBottomColor: "#edf2fb",
  },
  panelTabText: {
    color: "#9ea8bb",
    fontSize: 16,
    fontWeight: "500",
  },
  panelTabTextActive: {
    color: "#111111",
    fontWeight: "700",
  },
  panelBody: {
    backgroundColor: "#f7fbff",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#edf2fb",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  titleActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 2,
  },
  title: {
    flex: 1,
    color: "#111111",
    fontSize: 20,
    fontWeight: "800",
  },
  favoriteButton: {
    paddingVertical: 2,
  },
  favoriteButtonText: {
    color: "#8a94a6",
    fontSize: 14,
    fontWeight: "700",
  },
  favoriteButtonTextActive: {
    color: "#8cabff",
  },
  introButton: {
    paddingTop: 2,
  },
  introButtonText: {
    color: "#222222",
    fontSize: 14,
  },
  introText: {
    marginTop: 10,
    color: "#616a79",
    fontSize: 13,
    lineHeight: 20,
  },
  meta: {
    marginTop: 10,
    color: "#4c4c4c",
    fontSize: 13,
    lineHeight: 18,
  },
  episodeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  episodeHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },
  episodeHeaderMeta: {
    color: "#333333",
    fontSize: 14,
  },
  groupBlock: {
    marginBottom: 16,
  },
  sourceBar: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "#e2eaf8",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sourceBarText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "700",
  },
  sourceBarAction: {
    color: "#8b6525",
    fontSize: 14,
    fontWeight: "700",
  },
  pageRangeRow: {
    gap: 8,
    paddingBottom: 10,
  },
  pageRangeButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "#e2eaf8",
    justifyContent: "center",
    alignItems: "center",
  },
  pageRangeButtonActive: {
    backgroundColor: "#ffffff",
    borderColor: "#8cabff",
  },
  pageRangeText: {
    color: "#7f8a99",
    fontSize: 12,
    fontWeight: "700",
  },
  pageRangeTextActive: {
    color: "#2f4f89",
  },
  episodeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  episodeButton: {
    width: "30.5%",
    flexGrow: 1,
    minHeight: 54,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "#e2eaf8",
    justifyContent: "center",
    alignItems: "center",
  },
  episodeButtonActive: {
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#8cabff",
  },
  episodeText: {
    color: "#111111",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  episodeTextActive: {
    color: "#ffffff",
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: "center",
  },
});

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useEvent } from "expo";
import { useVideoPlayer, VideoView } from "expo-video";
import { splitPlaySources } from "../lib/cms";
import { colors } from "../styles/theme";

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
  onToggleFavorite,
  onTrackHistory,
  onBack,
  onEpisodePick,
}) {
  const groups = useMemo(
    () => splitPlaySources(video?.playFrom || "", video?.playUrl || ""),
    [video]
  );
  const [episodePageMap, setEpisodePageMap] = useState({});
  const playableUrl = usePlayableUrl(episode?.url || "");
  const player = useVideoPlayer(null);
  const { status, error } = useEvent(player, "statusChange", {
    status: player.status,
    error: null,
  });
  const translateX = useRef(new Animated.Value(0)).current;
  const [introExpanded, setIntroExpanded] = useState(false);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 16 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(gestureState.dx);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -72) {
            Animated.timing(translateX, {
              toValue: -220,
              duration: 160,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              onBack();
            });
            return;
          }

          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 0,
          }).start();
        },
      }),
    [onBack, translateX]
  );

  useEffect(() => {
    if (!playableUrl) {
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        await player.replaceAsync(playableUrl);
        if (!cancelled) {
          player.play();
        }
      } catch (error) {
        /*
         * 2026-03-26
         * 详情页现在直接承载播放，切剧集时必须容忍旧播放器实例已经失效的瞬间。
         * 这里不把切换时的 native 瞬时异常继续抛给界面，避免 iOS 上直接红屏。
         */
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [player, playableUrl]);

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
    <Animated.View
      style={[
        styles.pageWrap,
        {
          transform: [{ translateX }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <ScrollView style={styles.page} contentContainerStyle={styles.container}>
        <View style={styles.playerNavBar}>
          <Pressable style={styles.playerNavBack} onPress={onBack}>
            <Text style={styles.playerNavBackText}>‹ 返回</Text>
          </Pressable>
          <Text style={styles.playerNavTitleDark} numberOfLines={1}>
            {video?.name || "详情"}
          </Text>
          <View style={styles.playerNavSide} />
        </View>

        <View style={styles.playerCard}>
          <View style={styles.playerShell}>
          {playableUrl ? (
            <>
              <VideoView
                key={playableUrl}
                style={styles.video}
                player={player}
                nativeControls
                allowsPictureInPicture
              />
              {(status === "loading" || status === "idle") ? (
                <View style={styles.playerOverlay}>
                  <View style={styles.playerOverlayBadge}>
                    <ActivityIndicator size="small" color="#111111" />
                  </View>
                </View>
              ) : null}
              {status === "error" ? (
                <View style={styles.playerOverlay}>
                  <View style={styles.playerErrorBadge}>
                    <Text style={styles.playerErrorTitle}>当前线路加载失败</Text>
                    <Text style={styles.playerErrorText} numberOfLines={2}>
                      {error?.message || "可以切换其他剧集或线路再试"}
                    </Text>
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.videoEmpty}>
              <Text style={styles.videoEmptyText}>请选择剧集开始播放</Text>
            </View>
          )}
          </View>
        </View>

        <View style={styles.panelTabs}>
          <Text style={[styles.panelTabText, styles.panelTabTextActive]}>视频</Text>
        </View>

        <View style={styles.panelBody}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{video?.name || "视频详情"}</Text>
            <View style={styles.titleActions}>
              <Pressable style={styles.favoriteButton} onPress={() => onToggleFavorite?.(video)}>
                <Text style={[styles.favoriteButtonText, isFavorite && styles.favoriteButtonTextActive]}>
                  {isFavorite ? "已收藏" : "收藏"}
                </Text>
              </Pressable>
              <Pressable style={styles.introButton} onPress={() => setIntroExpanded((current) => !current)}>
                <Text style={styles.introButtonText}>{introExpanded ? "收起" : "简介 >"}</Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.meta}>
            {video?.year || "--"} / {video?.area || "未知地区"} / {video?.typeName || "未分类"}
          </Text>
          {introExpanded ? (
            <Text style={styles.introText}>
              {video?.content || video?.remarks || "暂无简介"}
            </Text>
          ) : null}
        </View>

        <View style={styles.panelBody}>
          <View style={styles.episodeHeader}>
            <Text style={styles.episodeHeaderTitle}>选集</Text>
            <Text style={styles.episodeHeaderMeta}>{video?.remarks || ""}</Text>
          </View>
          {groups.length ? (
            groups.map((group) => (
              <View key={group.id} style={styles.groupBlock}>
                <View style={styles.sourceBar}>
                  <Text style={styles.sourceBarText}>
                    {group.name} {group.episodes.length} 个视频
                  </Text>
                  <Text style={styles.sourceBarAction}>切换资源</Text>
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
                          style={[styles.pageRangeButton, selected && styles.pageRangeButtonActive]}
                          onPress={() =>
                            setEpisodePageMap((current) => ({
                              ...current,
                              [group.id]: pageIndex,
                            }))
                          }
                        >
                          <Text style={[styles.pageRangeText, selected && styles.pageRangeTextActive]}>
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
                        style={[styles.episodeButton, active && styles.episodeButtonActive]}
                        onPress={() => onEpisodePick(item)}
                      >
                        <Text style={[styles.episodeText, active && styles.episodeTextActive]} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </Pressable>
                    );
                    })}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>暂无播放线路</Text>
              <Text style={styles.emptyText}>这个源如果支持详情接口，再点一次通常会自动补全。</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
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
  playerNavBar: {
    minHeight: 50,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7fbff",
    borderBottomWidth: 1,
    borderBottomColor: "#edf2fb",
  },
  playerCard: {
    backgroundColor: "#000000",
  },
  playerShell: {
    aspectRatio: 16 / 9,
    width: "100%",
    backgroundColor: "#000",
  },
  playerNavBack: {
    minWidth: 58,
    height: 32,
    justifyContent: "center",
  },
  playerNavBackText: {
    color: "#111111",
    fontSize: 13,
    fontWeight: "700",
  },
  playerNavTitleDark: {
    flex: 1,
    textAlign: "center",
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
    marginHorizontal: 8,
  },
  playerNavSide: {
    minWidth: 58,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.18)",
  },
  playerOverlayBadge: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderWidth: 1,
    borderColor: "#dce3ef",
    justifyContent: "center",
    alignItems: "center",
  },
  playerErrorBadge: {
    width: "78%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderWidth: 1,
    borderColor: "#f2d0cb",
  },
  playerErrorTitle: {
    color: "#d65f51",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  playerErrorText: {
    marginTop: 6,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  videoEmpty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoEmptyText: {
    color: colors.textMuted,
    fontSize: 13,
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
    color: "#111111",
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#f7fbff",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import DiscoverScreen from "./src/screens/DiscoverScreen";
import SourcesScreen from "./src/screens/SourcesScreen";
import DetailScreen from "./src/screens/DetailScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import TabBar from "./src/components/TabBar";
import { fetchCatalog, fetchVodDetail, splitPlaySources } from "./src/lib/cms";
import { createScreenStyles, getTheme } from "./src/styles/theme";

const DEFAULT_SOURCE = "https://jyzyapi.com/provide/vod/from/jinyingm3u8/at/json";
const INITIAL_CATEGORIES = [{ id: "all", name: "全部" }];
const INITIAL_SOURCES = [{ id: "default", name: "默认示例源", url: DEFAULT_SOURCE, note: "" }];
const STORAGE_SOURCES_KEY = "videos_cms_saved_sources";
const STORAGE_ACTIVE_SOURCE_KEY = "videos_cms_active_source";
const STORAGE_FAVORITES_KEY = "videos_cms_favorites";
const STORAGE_HISTORY_KEY = "videos_cms_history";
const STORAGE_THEME_MODE_KEY = "videos_cms_theme_mode";
const TABS = [
  { id: "discover", label: "发现" },
  { id: "sources", label: "源管理" },
  { id: "profile", label: "我的" },
];

export default function App() {
  const mountedRef = useRef(true);
  const [activeTab, setActiveTab] = useState("discover");
  const [sourceUrl, setSourceUrl] = useState(DEFAULT_SOURCE);
  const [savedSources, setSavedSources] = useState(INITIAL_SOURCES);
  const [siteName, setSiteName] = useState("未加载");
  const [format, setFormat] = useState("");
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailLoadingId, setDetailLoadingId] = useState("");
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [profileView, setProfileView] = useState("menu");
  const [themeMode, setThemeMode] = useState("light");

  const colors = useMemo(() => getTheme(themeMode), [themeMode]);
  const screenStyles = useMemo(() => createScreenStyles(colors), [colors]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const hydrateSources = async () => {
      try {
        const [storedSourcesRaw, storedActiveSource, storedFavoritesRaw, storedHistoryRaw, storedThemeMode] = await Promise.all([
          AsyncStorage.getItem(STORAGE_SOURCES_KEY),
          AsyncStorage.getItem(STORAGE_ACTIVE_SOURCE_KEY),
          AsyncStorage.getItem(STORAGE_FAVORITES_KEY),
          AsyncStorage.getItem(STORAGE_HISTORY_KEY),
          AsyncStorage.getItem(STORAGE_THEME_MODE_KEY),
        ]);

        const storedSources = storedSourcesRaw !== null ? JSON.parse(storedSourcesRaw) : null;
        const storedFavorites = storedFavoritesRaw !== null ? JSON.parse(storedFavoritesRaw) : null;
        const storedHistory = storedHistoryRaw !== null ? JSON.parse(storedHistoryRaw) : null;
        const nextSources = Array.isArray(storedSources) ? storedSources : INITIAL_SOURCES;
        const nextFavorites = Array.isArray(storedFavorites) ? storedFavorites : [];
        const nextHistory = Array.isArray(storedHistory) ? storedHistory : [];
        const nextActiveSource =
          storedActiveSource && (nextSources.some((item) => item.url === storedActiveSource) || !nextSources.length)
            ? storedActiveSource
            : nextSources[0]?.url || DEFAULT_SOURCE;

        if (!mountedRef.current) {
          return;
        }

        /*
         * 2026-03-26
         * 源列表和当前源必须一起恢复。
         * 否则用户刚保存过的源虽然还在本地，但启动时会被默认源顶掉，切换体验会很乱。
         */
        setSavedSources(nextSources);
        setSourceUrl(nextActiveSource);
        setFavorites(nextFavorites);
        setHistory(nextHistory);
        setThemeMode(storedThemeMode === "dark" ? "dark" : "light");
        loadCatalog({
          nextSourceUrl: nextActiveSource,
          nextCategory: "all",
          nextKeyword: "",
          nextPage: 1,
          reset: true,
        });
      } catch (storageError) {
        loadCatalog({
          nextSourceUrl: DEFAULT_SOURCE,
          nextCategory: "all",
          nextKeyword: "",
          nextPage: 1,
          reset: true,
        });
      }
    };

    hydrateSources();
  }, []);

  const mergeCategories = (items) => {
    setCategories((current) => {
      const map = new Map(current.map((item) => [item.id, item]));
      items.forEach((item) => map.set(item.id, item));
      const sorted = [...map.values()].filter((item) => item.id !== "all");
      sorted.sort((a, b) => a.id.localeCompare(b.id, "zh-CN"));
      return [{ id: "all", name: "全部" }, ...sorted];
    });
  };

  const loadCatalog = async ({ nextSourceUrl, nextCategory, nextKeyword, nextPage, reset }) => {
    const targetSourceUrl = nextSourceUrl || sourceUrl;
    const targetCategory = nextCategory ?? selectedCategory;
    const targetKeyword = nextKeyword ?? submittedKeyword;
    const targetPage = nextPage || 1;

    if (!targetSourceUrl.trim()) {
      setError("先输入一个播放源地址。");
      return;
    }

    setError("");
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const result = await fetchCatalog(targetSourceUrl, {
        page: targetPage,
        typeId: targetCategory,
        keyword: targetKeyword,
      });

      if (!mountedRef.current) {
        return;
      }

      setSourceUrl(targetSourceUrl);
      setSiteName(result.siteName || "已加载源");
      setFormat(result.format);
      mergeCategories(result.categories);
      setPage(result.page || targetPage);
      setPageCount(result.pageCount || targetPage);
      setTotal(result.total || result.videos.length);
      setVideos((current) => (reset ? result.videos : [...current, ...result.videos]));
    } catch (fetchError) {
      setError(fetchError?.message || "播放源加载失败，请检查地址或网络。");
      if (reset) {
        setVideos([]);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  const persistSourcesState = async (nextSources, nextActiveSource) => {
    try {
      await AsyncStorage.setItem(STORAGE_SOURCES_KEY, JSON.stringify(nextSources));
      await AsyncStorage.setItem(STORAGE_ACTIVE_SOURCE_KEY, nextActiveSource);
    } catch (storageError) {
      /*
       * 2026-03-26
       * 这里继续采用“每次增删切换立即落盘”。
       * 用户对源切换和保存非常敏感，不能依赖后续 state 联动去碰运气。
       */
    }
  };

  const persistFavorites = async (nextFavorites) => {
    try {
      await AsyncStorage.setItem(STORAGE_FAVORITES_KEY, JSON.stringify(nextFavorites));
    } catch (storageError) {
      /*
       * 2026-03-26
       * 收藏需要单独落盘，不能绑在源切换流程里。
       * 否则用户切完源或重进应用后，“我的收藏”会看起来像失效了。
       */
    }
  };

  const persistHistory = useCallback(async (nextHistory) => {
    try {
      await AsyncStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(nextHistory));
    } catch (storageError) {
      /*
       * 2026-03-26
       * 播放记录要记到具体集数。
       * 这里独立落盘，避免被收藏或源切换状态覆盖。
       */
    }
  }, []);

  const persistThemeMode = useCallback(async (nextMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_THEME_MODE_KEY, nextMode);
    } catch (storageError) {}
  }, []);

  const upsertSource = (url, name) => {
    const trimmedUrl = url.trim();
    const trimmedName = (name || "").trim() || "未命名源";

    if (!trimmedUrl) {
      return null;
    }

    const existed = savedSources.find((item) => item.url === trimmedUrl);
    const nextItem = existed || { id: `source-${Date.now()}`, name: trimmedName, url: trimmedUrl, note: "" };
    const nextSources = existed
      ? savedSources.map((item) =>
          item.url === trimmedUrl ? { ...item, name: trimmedName } : item
        )
      : [...savedSources, nextItem];

    setSavedSources(nextSources);
    persistSourcesState(nextSources, trimmedUrl);

    return { url: trimmedUrl, name: trimmedName, sources: nextSources };
  };

  const resetCatalogFilters = () => {
    setSelectedCategory("all");
    setSubmittedKeyword("");
    setKeyword("");
    setCategories(INITIAL_CATEGORIES);
  };

  const switchSource = (item) => {
    setSelectedVideo(null);
    setSelectedEpisode(null);
    resetCatalogFilters();
    loadCatalog({
      nextSourceUrl: item.url,
      nextCategory: "all",
      nextKeyword: "",
      nextPage: 1,
      reset: true,
    });
    persistSourcesState(savedSources, item.url);
  };

  const handleApplySaved = (item) => {
    switchSource(item);
  };

  const handleDeleteSaved = (item) => {
    if (!item?.id) {
      return;
    }

    Alert.alert(
      "确认删除",
      `确定删除源“${item.name || "未命名源"}”吗？`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "删除",
          style: "destructive",
          onPress: () => {
            const nextSources = savedSources.filter((source) => source.id !== item.id);
    const activeStillExists = nextSources.some((item) => item.url === sourceUrl);
    const fallback = nextSources[0];

            setSavedSources(nextSources);

            if (!activeStillExists) {
              const nextActiveSource = fallback?.url || DEFAULT_SOURCE;
              resetCatalogFilters();
              loadCatalog({
                nextSourceUrl: nextActiveSource,
                nextCategory: "all",
                nextKeyword: "",
                nextPage: 1,
                reset: true,
              });
              persistSourcesState(nextSources, nextActiveSource);
              return;
            }

            persistSourcesState(nextSources, sourceUrl);
          },
        },
      ]
    );
  };

  const handleEditSourceNote = (item) => {
    if (!item?.id) {
      return;
    }

    if (Platform.OS !== "ios" || typeof Alert.prompt !== "function") {
      Alert.alert("暂不支持", "当前先按 iPhone 原生弹窗方案做备注编辑。");
      return;
    }

    Alert.prompt(
      "编辑备注",
      item.name,
      [
        { text: "取消", style: "cancel" },
        {
          text: "保存",
          onPress: (rawNote) => {
            const nextNote = (rawNote || "").trim();
            const nextSources = savedSources.map((source) =>
              source.id === item.id ? { ...source, note: nextNote } : source
            );

            /*
             * 2026-03-26
             * 备注只属于源管理信息，不参与切源逻辑。
             * 这里单独更新并立刻落盘，避免因为切源流程把备注改动丢掉。
             */
            setSavedSources(nextSources);
            persistSourcesState(nextSources, sourceUrl);
          },
        },
      ],
      "plain-text",
      item.note || ""
    );
  };

  const importSourceFromPrompt = (url, name) => {
    const saved = upsertSource(url, name);
    if (!saved) {
      setError("先输入一个播放源地址。");
      return;
    }

    setActiveTab("discover");
    resetCatalogFilters();
    loadCatalog({
      nextSourceUrl: saved.url,
      nextCategory: "all",
      nextKeyword: "",
      nextPage: 1,
      reset: true,
    });
  };

  const openAddSourcePrompt = () => {
    if (Platform.OS !== "ios" || typeof Alert.prompt !== "function") {
      Alert.alert("暂不支持", "当前先按 iPhone 原生弹窗方案做，Android 后面我再给你补原生风格输入。");
      return;
    }

    Alert.prompt(
      "新增源",
      "输入苹果 CMS JSON/XML 源地址",
      [
        { text: "取消", style: "cancel" },
        {
          text: "下一步",
          onPress: (rawUrl) => {
            const nextUrl = (rawUrl || "").trim();
            if (!nextUrl) {
              return;
            }

            Alert.prompt(
              "源名称",
              "给这个源起个名字",
              [
                { text: "取消", style: "cancel" },
                {
                  text: "导入",
                  onPress: (rawName) => {
                    importSourceFromPrompt(nextUrl, rawName || "我的源");
                  },
                },
              ],
              "plain-text",
              "我的源"
            );
          },
        },
      ],
      "plain-text",
      ""
    );
  };

  const openSourceSelector = () => {
    if (!savedSources.length) {
      Alert.alert("暂无已保存源", "先去源管理右上角加一个源。");
      return;
    }

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "切换源",
          options: [...savedSources.map((item) => item.name), "取消"],
          cancelButtonIndex: savedSources.length,
        },
        (buttonIndex) => {
          if (buttonIndex >= 0 && buttonIndex < savedSources.length) {
            handleApplySaved(savedSources[buttonIndex]);
          }
        }
      );
      return;
    }

    Alert.alert(
      "切换源",
      undefined,
      [
        ...savedSources.map((item) => ({
          text: item.name,
          onPress: () => handleApplySaved(item),
        })),
        { text: "取消", style: "cancel" },
      ]
    );
  };

  const openVideo = async (video, preferredEpisode) => {
    setSelectedVideo(video);
    const existedGroups = splitPlaySources(video.playFrom, video.playUrl);

    if (existedGroups.length) {
      const allEpisodes = existedGroups.flatMap((group) => group.episodes);
      const matchedEpisode =
        allEpisodes.find((item) => item.url === preferredEpisode?.url) ||
        allEpisodes.find((item) => item.name === preferredEpisode?.name) ||
        existedGroups[0]?.episodes?.[0] ||
        null;

      setSelectedEpisode(matchedEpisode);
      return;
    }

    setDetailLoadingId(video.id);
    try {
      const detail = await fetchVodDetail(sourceUrl, video.id);
      if (!detail || !mountedRef.current) {
        return;
      }

      setVideos((current) => current.map((item) => (item.id === detail.id ? detail : item)));
      setSelectedVideo(detail);
      const detailGroups = splitPlaySources(detail.playFrom, detail.playUrl);
      const detailEpisodes = detailGroups.flatMap((group) => group.episodes);
      const matchedEpisode =
        detailEpisodes.find((item) => item.url === preferredEpisode?.url) ||
        detailEpisodes.find((item) => item.name === preferredEpisode?.name) ||
        detailGroups[0]?.episodes?.[0] ||
        null;

      setSelectedEpisode(matchedEpisode);
    } catch (fetchError) {
      setError(fetchError?.message || "视频详情加载失败。");
    } finally {
      if (mountedRef.current) {
        setDetailLoadingId("");
      }
    }
  };

  const handleSearch = () => {
    setSubmittedKeyword(keyword.trim());
    loadCatalog({
      nextCategory: selectedCategory,
      nextKeyword: keyword.trim(),
      nextPage: 1,
      reset: true,
    });
  };

  const handleClearSearch = () => {
    setKeyword("");
    setSubmittedKeyword("");
    loadCatalog({
      nextCategory: selectedCategory,
      nextKeyword: "",
      nextPage: 1,
      reset: true,
    });
  };

  const handleSelectCategory = (id) => {
    setSelectedCategory(id);
    loadCatalog({
      nextCategory: id,
      nextKeyword: submittedKeyword,
      nextPage: 1,
      reset: true,
    });
  };

  const handleLoadMore = () => {
    loadCatalog({
      nextPage: page + 1,
      reset: false,
    });
  };

  const activeSourceName = useMemo(() => {
    return savedSources.find((item) => item.url === sourceUrl)?.name || siteName || "当前源";
  }, [savedSources, sourceUrl, siteName]);
  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites]);

  const handleToggleFavorite = (video) => {
    if (!video?.id) {
      return;
    }

    const existed = favorites.find((item) => item.id === video.id);
    const nextFavorites = existed
      ? favorites.filter((item) => item.id !== video.id)
      : [
          {
            id: video.id,
            name: video.name,
            pic: video.pic,
            remarks: video.remarks,
            year: video.year,
            area: video.area,
            typeName: video.typeName,
            playFrom: video.playFrom,
            playUrl: video.playUrl,
          },
          ...favorites,
        ];

    setFavorites(nextFavorites);
    persistFavorites(nextFavorites);
  };

  const handleTrackHistory = useCallback((video, episode) => {
    if (!video?.id || !episode?.url) {
      return;
    }

    const nextItem = {
      id: video.id,
      historyId: `${video.id}::${episode.id || episode.url}`,
      name: video.name,
      pic: video.pic,
      year: video.year,
      area: video.area,
      typeName: video.typeName,
      episodeName: episode.name,
      episodeUrl: episode.url,
      playFrom: video.playFrom,
      playUrl: video.playUrl,
      updatedAt: Date.now(),
    };

    /*
     * 2026-03-26
     * 播放记录必须按函数式更新写入。
     * 详情页切集时会触发 effect，这里如果捕获旧的 history 闭包，会在 iOS 上形成重复 setState。
     */
    setHistory((current) => {
      const nextHistory = [nextItem, ...current.filter((item) => item.historyId !== nextItem.historyId)].slice(0, 80);
      persistHistory(nextHistory);
      return nextHistory;
    });
  }, [persistHistory]);

  const profileTitle = useMemo(() => {
    if (profileView === "history") {
      return "播放记录";
    }

    if (profileView === "favorites") {
      return "收藏记录";
    }

    return "我的";
  }, [profileView]);

  const toggleThemeMode = useCallback(() => {
    setThemeMode((current) => {
      const nextMode = current === "dark" ? "light" : "dark";
      persistThemeMode(nextMode);
      return nextMode;
    });
  }, [persistThemeMode]);

  return (
    <SafeAreaView style={screenStyles.safeArea} edges={["top"]}>
      <ExpoStatusBar style={themeMode === "dark" ? "light" : "dark"} />
      <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />

      <View style={screenStyles.container}>
        {!selectedVideo ? (
          <View style={[styles.topBar, { backgroundColor: colors.bgSoft }]}>
            <View style={styles.topBarLeft}>
              <Text style={[styles.topBarTitle, { color: colors.textStrong }]}>
                {activeTab === "discover" ? "歧途" : activeTab === "sources" ? "源管理" : profileTitle}
              </Text>
              <Text style={[styles.topBarText, { color: colors.textMuted }]} numberOfLines={1}>
                {activeTab === "discover"
                  ? siteName
                  : activeTab === "sources"
                    ? `已保存 ${savedSources.length} 个源`
                    : profileView === "menu"
                      ? activeSourceName
                      : profileView === "history"
                        ? `共 ${history.length} 条`
                        : `共 ${favorites.length} 条`}
              </Text>
            </View>
            {activeTab === "discover" ? (
              <Text style={[styles.sourceTrigger, { color: colors.accentSoft }]} onPress={openSourceSelector} numberOfLines={1}>
                {activeSourceName} ▾
              </Text>
            ) : activeTab === "sources" ? (
              <Text style={[styles.addTrigger, { color: colors.textPrimary }]} onPress={openAddSourcePrompt}>
                ＋
              </Text>
            ) : null}
          </View>
        ) : null}

        <View style={styles.mainLayer}>
          <View style={[styles.screenLayer, activeTab === "discover" ? styles.screenLayerVisible : styles.screenLayerHidden]}>
            {loading && !videos.length ? (
              <View style={styles.loadingScreen}>
                <ActivityIndicator color={colors.accent} size="large" />
                <Text style={styles.loadingText}>正在拉取视频源...</Text>
              </View>
            ) : (
              <DiscoverScreen
                categories={categories}
                selectedCategory={selectedCategory}
                keyword={keyword}
                setKeyword={setKeyword}
                page={page}
                pageCount={pageCount}
                total={total}
                videos={videos}
                loading={loading}
                loadingMore={loadingMore}
                detailLoadingId={detailLoadingId}
                onOpenVideo={openVideo}
                colors={colors}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                onSelectCategory={handleSelectCategory}
                onLoadMore={handleLoadMore}
              />
            )}
          </View>

          <View style={[styles.screenLayer, activeTab === "sources" ? styles.screenLayerVisible : styles.screenLayerHidden]}>
            <SourcesScreen
              siteName={siteName}
              sourceUrl={sourceUrl}
              format={format}
              error={error}
              savedSources={savedSources}
              colors={colors}
              onApplySaved={handleApplySaved}
              onDeleteSaved={handleDeleteSaved}
              onEditNote={handleEditSourceNote}
              onOpenAdd={openAddSourcePrompt}
            />
          </View>

          <View style={[styles.screenLayer, activeTab === "profile" ? styles.screenLayerVisible : styles.screenLayerHidden]}>
            {profileView === "menu" ? (
              <ProfileScreen
                activeSourceName={activeSourceName}
                historyCount={history.length}
                favoritesCount={favorites.length}
                themeMode={themeMode}
                colors={colors}
                onToggleThemeMode={toggleThemeMode}
                onOpenHistory={() => setProfileView("history")}
                onOpenFavorites={() => setProfileView("favorites")}
              />
            ) : null}

            {profileView === "history" ? (
              <HistoryScreen
                history={history}
                colors={colors}
                onBack={() => setProfileView("menu")}
                onOpenHistory={(item) =>
                  openVideo(item, {
                    url: item.episodeUrl,
                    name: item.episodeName,
                  })
                }
              />
            ) : null}

            {profileView === "favorites" ? (
              <FavoritesScreen
                favorites={favorites}
                colors={colors}
                onBack={() => setProfileView("menu")}
                onOpenVideo={openVideo}
                onRemoveFavorite={handleToggleFavorite}
              />
            ) : null}
          </View>

          {selectedVideo ? (
            <View style={styles.detailLayer}>
              <DetailScreen
                video={selectedVideo}
                episode={selectedEpisode}
                detailLoadingId={detailLoadingId}
                isFavorite={favoriteIds.has(selectedVideo.id)}
                colors={colors}
                onToggleFavorite={handleToggleFavorite}
                onTrackHistory={handleTrackHistory}
                onBack={() => {
                  setSelectedVideo(null);
                  setSelectedEpisode(null);
                }}
                onEpisodePick={setSelectedEpisode}
              />
            </View>
          ) : null}
        </View>

        {!selectedVideo ? <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} colors={colors} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#f7fbff",
  },
  topBarLeft: {
    flex: 1,
  },
  topBarTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#101318",
  },
  topBarText: {
    marginTop: 3,
    color: "#7f8a99",
    fontSize: 12,
  },
  sourceTrigger: {
    maxWidth: 180,
    color: "#3a568c",
    fontSize: 14,
    fontWeight: "700",
  },
  addTrigger: {
    color: "#111111",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "400",
  },
  mainLayer: {
    flex: 1,
  },
  screenLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  screenLayerVisible: {
    opacity: 1,
    pointerEvents: "auto",
  },
  screenLayerHidden: {
    opacity: 0,
    pointerEvents: "none",
  },
  detailLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    backgroundColor: "#ffffff",
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#ffffff",
  },
  loadingText: {
    color: "#7f8a99",
    fontSize: 14,
  },
});

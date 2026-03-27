import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import * as ScreenOrientation from "expo-screen-orientation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AUTO_HIDE_DELAY = 5000;
const DOUBLE_TAP_DELAY = 280;

function formatTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) {
    return "00:00";
  }

  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function DramaPlayer({
  source,
  title,
  onBack,
  onNextEpisode,
  nextEpisodeLabel = "下一集",
}) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const fullscreenTopInset = Math.max(insets.top, 6);
  const fullscreenSideInsetLeft = Math.max(insets.left, 0);
  const fullscreenSideInsetRight = Math.max(insets.right, 0);
  const fullscreenBottomInset = Math.max(insets.bottom, 8);
  const controlsTimerRef = useRef(null);
  const tapTimerRef = useRef(null);
  const hintTimerRef = useRef(null);
  const surfaceLayoutRef = useRef({ width: 0, height: 0 });
  const tapStateRef = useRef({ lastAt: 0, zone: "" });
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState("landscape");
  const [gestureHint, setGestureHint] = useState("");
  const [progressWidth, setProgressWidth] = useState(0);
  const [progressPreviewSeconds, setProgressPreviewSeconds] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [snapshot, setSnapshot] = useState({
    status: "idle",
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 1,
  });

  const player = useVideoPlayer(source || null, (instance) => {
    instance.timeUpdateEventInterval = 0.25;
    instance.volume = 1;
    if (source) {
      instance.play();
    }
  });

  const progress = useMemo(() => {
    if (!snapshot.duration) {
      return 0;
    }

    const active = progressPreviewSeconds ?? snapshot.currentTime;
    return Math.min(1, active / snapshot.duration);
  }, [progressPreviewSeconds, snapshot.currentTime, snapshot.duration]);

  const shouldShowLoading = Boolean(source) && (snapshot.status === "loading" || snapshot.status === "idle");
  const shouldShowPlaybackError = Boolean(source) && snapshot.status === "error";

  const clearControlsTimer = () => {
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
      controlsTimerRef.current = null;
    }
  };

  const clearTapTimer = () => {
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
    }
  };

  const flashHint = (text, duration = 900) => {
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
    }
    setGestureHint(text);
    hintTimerRef.current = setTimeout(() => {
      setGestureHint("");
      hintTimerRef.current = null;
    }, duration);
  };

  const resetControlsTimer = (isPlaying) => {
    clearControlsTimer();
    setShowControls(true);

    if (!isPlaying) {
      return;
    }

    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, AUTO_HIDE_DELAY);
  };

  const syncSnapshot = () => {
    setSnapshot({
      status: player?.status || "idle",
      currentTime: player?.currentTime || 0,
      duration: player?.duration || 0,
      isPlaying: Boolean(player?.playing),
      volume: typeof player?.volume === "number" ? player.volume : 1,
    });
  };

  const seekTo = (seconds) => {
    if (!player || !snapshot.duration) {
      return;
    }

    const bounded = Math.min(snapshot.duration, Math.max(0, seconds));
    setProgressPreviewSeconds(bounded);
    player.currentTime = bounded;
    resetControlsTimer(snapshot.isPlaying);
  };

  const previewSeekTo = (locationX) => {
    if (!snapshot.duration || !progressWidth) {
      return null;
    }

    const ratio = Math.min(1, Math.max(0, locationX / progressWidth));
    const nextSeconds = ratio * snapshot.duration;
    setProgressPreviewSeconds(nextSeconds);
    setGestureHint(`拖动到 ${formatTime(nextSeconds)}`);
    return nextSeconds;
  };

  const togglePlayPause = () => {
    if (!player) {
      return;
    }

    if (snapshot.isPlaying) {
      player.pause();
      clearControlsTimer();
      setShowControls(true);
      return;
    }

    player.play();
    resetControlsTimer(true);
  };

  const handleSeekPress = (locationX) => {
    if (!snapshot.duration || !progressWidth) {
      return;
    }

    const ratio = Math.min(1, Math.max(0, locationX / progressWidth));
    seekTo(ratio * snapshot.duration);
  };

  const openFullscreen = async (mode) => {
    setFullscreenMode(mode);
    setIsFullscreen(true);
    if (mode === "portrait") {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
    StatusBar.setHidden(true, "fade");
    resetControlsTimer(snapshot.isPlaying);
  };

  const closeFullscreen = async () => {
    setIsFullscreen(false);
    setFullscreenMode("landscape");
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    StatusBar.setHidden(false, "fade");
  };

  const resolveTapZone = (locationX) => {
    const currentWidth = surfaceLayoutRef.current.width || 1;
    if (locationX < currentWidth * 0.34) {
      return "left";
    }
    if (locationX > currentWidth * 0.66) {
      return "right";
    }
    return "center";
  };

  const handleTapRelease = (locationX) => {
    const zone = resolveTapZone(locationX);
    const now = Date.now();
    const isDoubleTap = tapStateRef.current.zone === zone && now - tapStateRef.current.lastAt <= DOUBLE_TAP_DELAY;

    clearTapTimer();

    if (showControls) {
      clearControlsTimer();
      setShowControls(false);
      setGestureHint("");
      tapStateRef.current = { lastAt: 0, zone: "" };
      return;
    }

    setShowControls(true);
    resetControlsTimer(true);
    tapStateRef.current = { lastAt: now, zone };
    tapTimerRef.current = setTimeout(() => {
      tapStateRef.current = { lastAt: 0, zone: "" };
      tapTimerRef.current = null;
    }, DOUBLE_TAP_DELAY);
  };

  const handleOverlayPress = (event) => {
    handleTapRelease(event.nativeEvent.locationX || 0);
  };

  const handleProgressGrant = (event) => {
    setIsScrubbing(true);
    const nextSeconds = previewSeekTo(event.nativeEvent.locationX || 0);
    if (nextSeconds !== null) {
      setShowControls(true);
      clearControlsTimer();
    }
  };

  const handleProgressMove = (event) => {
    previewSeekTo(event.nativeEvent.locationX || 0);
  };

  const handleProgressRelease = (event) => {
    const nextSeconds = previewSeekTo(event.nativeEvent.locationX || 0);
    setIsScrubbing(false);
    if (nextSeconds !== null) {
      seekTo(nextSeconds);
      flashHint(`已定位到 ${formatTime(nextSeconds)}`, 700);
    }
  };

  const handleProgressTerminate = () => {
    setIsScrubbing(false);
    setProgressPreviewSeconds(null);
  };

  useEffect(() => {
    setShowControls(true);
    setGestureHint("");
    setProgressPreviewSeconds(null);
    clearControlsTimer();
    clearTapTimer();
  }, [source]);

  useEffect(() => {
    const timer = setInterval(syncSnapshot, 250);
    return () => clearInterval(timer);
  }, [player]);

  useEffect(() => {
    if (progressPreviewSeconds === null) {
      return;
    }

    if (Math.abs((snapshot.currentTime || 0) - progressPreviewSeconds) < 0.35) {
      setProgressPreviewSeconds(null);
    }
  }, [progressPreviewSeconds, snapshot.currentTime]);

  useEffect(() => {
    if (snapshot.isPlaying && snapshot.status === "readyToPlay") {
      resetControlsTimer(true);
    }
  }, [snapshot.isPlaying, snapshot.status]);

  useEffect(() => {
    return () => {
      clearTapTimer();
      clearControlsTimer();
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
      StatusBar.setHidden(false, "fade");
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  const renderSurface = (fullscreen) => (
    <View
      style={[
        styles.surface,
        fullscreen &&
          (fullscreenMode === "portrait"
            ? styles.surfaceFullscreenPortrait
            : styles.surfaceFullscreenLandscape),
      ]}
      onLayout={(event) => {
        surfaceLayoutRef.current = event.nativeEvent.layout;
      }}
    >
      {source ? (
        <VideoView
          player={player}
          style={styles.video}
          pointerEvents="none"
          contentFit="contain"
          nativeControls={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>请选择剧集开始播放</Text>
        </View>
      )}

      <Pressable style={styles.tapLayer} onPress={handleOverlayPress} />

      {shouldShowLoading ? (
        <View pointerEvents="none" style={styles.centerOverlay}>
          <View style={styles.loadingBadge}>
            <ActivityIndicator color="#ffffff" size="small" />
          </View>
        </View>
      ) : null}

      {shouldShowPlaybackError ? (
        <View pointerEvents="none" style={styles.centerOverlay}>
          <View style={styles.errorBadge}>
            <Text style={styles.errorTitle}>无法播放</Text>
            <Text style={styles.errorText}>当前视频源不可用</Text>
          </View>
        </View>
      ) : null}

      {!shouldShowLoading && !shouldShowPlaybackError && !snapshot.isPlaying && snapshot.currentTime > 0 ? (
        <View style={styles.centerPlayOverlay} pointerEvents="box-none">
          <Pressable onPress={togglePlayPause} style={styles.centerPlayButton} hitSlop={14}>
            <Ionicons name="play" size={28} color="#ffffff" />
          </Pressable>
        </View>
      ) : null}

      {gestureHint ? (
        <View pointerEvents="none" style={styles.hintOverlay}>
          <View style={styles.hintBadge}>
            <Text style={styles.hintText}>{gestureHint}</Text>
          </View>
        </View>
      ) : null}

      {showControls ? (
        fullscreen ? (
          <>
            <View
              style={[
                styles.fullscreenTopBar,
                {
                  top: fullscreenTopInset,
                  left: 14 + fullscreenSideInsetLeft,
                  right: 14 + fullscreenSideInsetRight,
                },
              ]}
            >
              <Pressable hitSlop={12} onPress={closeFullscreen} style={styles.topButton}>
                <Ionicons name="chevron-back" size={26} color="#ffffff" />
              </Pressable>
              <View style={styles.fullscreenTitleWrap} pointerEvents="none">
                <Text style={styles.fullscreenTitle} numberOfLines={1}>
                  {title || "视频标题"}
                </Text>
              </View>
              <View style={styles.fullscreenTopActions}>
                <Pressable
                  hitSlop={10}
                  onPress={fullscreenMode === "portrait" ? closeFullscreen : () => openFullscreen("portrait")}
                  style={styles.fullscreenTopIconButton}
                >
                  <MaterialCommunityIcons
                    name="phone-rotate-portrait"
                    size={22}
                    color={fullscreenMode === "portrait" ? "#ffffff" : "rgba(255,255,255,0.82)"}
                  />
                </Pressable>
                <Pressable
                  hitSlop={10}
                  onPress={fullscreenMode === "landscape" ? closeFullscreen : () => openFullscreen("landscape")}
                  style={styles.fullscreenTopIconButton}
                >
                  <MaterialCommunityIcons
                    name="arrow-expand-horizontal"
                    size={22}
                    color={fullscreenMode === "landscape" ? "#ffffff" : "rgba(255,255,255,0.82)"}
                  />
                </Pressable>
                <View style={styles.fullscreenTopIconButton}>
                  <Feather name="settings" size={20} color="#ffffff" />
                </View>
              </View>
            </View>

            <View
              style={[
                styles.fullscreenBottom,
                {
                  paddingLeft: 18 + fullscreenSideInsetLeft,
                  paddingRight: 18 + fullscreenSideInsetRight,
                  paddingBottom: 14 + fullscreenBottomInset,
                },
              ]}
            >
              <View style={styles.fullscreenProgressRow}>
                <Text style={styles.fullscreenTimeText}>
                  {formatTime(progressPreviewSeconds ?? snapshot.currentTime)} / {formatTime(snapshot.duration)}
                </Text>
                <View
                  style={styles.fullscreenProgressTrack}
                  onLayout={(event) => setProgressWidth(event.nativeEvent.layout.width)}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={handleProgressGrant}
                  onResponderMove={handleProgressMove}
                  onResponderRelease={handleProgressRelease}
                  onResponderTerminate={handleProgressTerminate}
                >
                  <View style={styles.progressTrackBg} />
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                  <View
                    style={[
                      styles.progressThumb,
                      isScrubbing && styles.progressThumbActive,
                      { left: `${progress * 100}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.fullscreenActionRow}>
                <Pressable hitSlop={10} onPress={togglePlayPause} style={styles.fullscreenActionIcon}>
                  <Ionicons
                    name={snapshot.isPlaying ? "pause" : "play"}
                    size={30}
                    color="#ffffff"
                  />
                </Pressable>
                <Pressable
                  hitSlop={10}
                  disabled={nextEpisodeLabel === "最后一集"}
                  onPress={nextEpisodeLabel === "最后一集" ? undefined : onNextEpisode}
                  style={styles.fullscreenActionIcon}
                >
                  <Ionicons
                    name="play-skip-forward"
                    size={24}
                    color={nextEpisodeLabel === "最后一集" ? "rgba(255,255,255,0.34)" : "#ffffff"}
                  />
                </Pressable>
                <Text style={styles.fullscreenTextAction}>选集</Text>
                <Text style={styles.fullscreenTextActionMuted}>倍速</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.topBar}>
              <Pressable hitSlop={12} onPress={onBack} style={styles.topButton}>
                <Ionicons name="chevron-back" size={24} color="#ffffff" />
              </Pressable>
              <Text style={styles.title} numberOfLines={1}>
                {title || "视频标题"}
              </Text>
              <View style={styles.topAction}>
                <Feather name="settings" size={18} color="#ffffff" />
              </View>
            </View>

            <View style={styles.bottomBar}>
              <Pressable hitSlop={10} onPress={togglePlayPause} style={styles.iconButton}>
                <Ionicons
                  name={snapshot.isPlaying ? "pause" : "play"}
                  size={26}
                  color="#ffffff"
                />
              </Pressable>

              <Pressable
                hitSlop={10}
                disabled={nextEpisodeLabel === "最后一集"}
                onPress={nextEpisodeLabel === "最后一集" ? undefined : onNextEpisode}
                style={[styles.nextButton, nextEpisodeLabel === "最后一集" && styles.nextButtonDisabled]}
              >
                <Ionicons
                  name="play-skip-forward"
                  size={21}
                  color={nextEpisodeLabel === "最后一集" ? "rgba(255,255,255,0.34)" : "#ffffff"}
                />
              </Pressable>

              <Text style={styles.timeText}>
                {formatTime(progressPreviewSeconds ?? snapshot.currentTime)} / {formatTime(snapshot.duration)}
              </Text>

              <View
                style={styles.progressTrack}
                onLayout={(event) => setProgressWidth(event.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={handleProgressGrant}
                onResponderMove={handleProgressMove}
                onResponderRelease={handleProgressRelease}
                onResponderTerminate={handleProgressTerminate}
              >
                <View style={styles.progressTrackBg} />
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                <View
                  style={[
                    styles.progressThumb,
                    isScrubbing && styles.progressThumbActive,
                    { left: `${progress * 100}%` },
                  ]}
                />
              </View>

              <Pressable hitSlop={10} onPress={() => openFullscreen("portrait")} style={styles.iconButton}>
                <MaterialCommunityIcons
                  name="cellphone"
                  size={20}
                  color="rgba(255,255,255,0.82)"
                />
              </Pressable>

              <Pressable hitSlop={10} onPress={() => openFullscreen("landscape")} style={styles.iconButton}>
                <Feather name="maximize" size={19} color="#ffffff" />
              </Pressable>
            </View>
          </>
        )
      ) : null}
    </View>
  );

  return (
    <>
      {!isFullscreen ? <View style={styles.frame}>{renderSurface(false)}</View> : null}
      <Modal visible={isFullscreen} transparent animationType="fade" onRequestClose={closeFullscreen}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSurface,
              fullscreenMode === "portrait"
                ? { width, height }
                : { width: height, height: width, transform: [{ rotate: "90deg" }] },
            ]}
          >
            {renderSurface(true)}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: "100%",
    backgroundColor: "#000000",
  },
  surface: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
  },
  surfaceFullscreenPortrait: {
    width: "100%",
    height: "100%",
    aspectRatio: undefined,
  },
  surfaceFullscreenLandscape: {
    width: "100%",
    height: "100%",
    aspectRatio: undefined,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  modalSurface: {
    backgroundColor: "#000000",
  },
  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000000",
  },
  tapLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "600",
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  centerPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  centerPlayButton: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingBadge: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: "rgba(15,15,15,0.86)",
    justifyContent: "center",
    alignItems: "center",
  },
  errorBadge: {
    minWidth: 136,
    minHeight: 62,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(12,12,12,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    marginTop: 4,
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
  },
  hintOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  hintBadge: {
    minWidth: 116,
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(12,12,12,0.82)",
    alignItems: "center",
    justifyContent: "center",
  },
  hintText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 58,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 4,
  },
  fullscreenTopBar: {
    position: "absolute",
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 4,
  },
  fullscreenTitleWrap: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 8,
    marginRight: 12,
    minWidth: 0,
  },
  topButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    marginHorizontal: 8,
  },
  fullscreenTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
    minWidth: 0,
  },
  topAction: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  fullscreenTopActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },
  fullscreenTopIconButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 3,
  },
  fullscreenBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingBottom: 14,
    zIndex: 3,
  },
  fullscreenProgressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullscreenTimeText: {
    width: 92,
    color: "#ffffff",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  fullscreenProgressTrack: {
    flex: 1,
    height: 28,
    justifyContent: "center",
    marginLeft: 2,
  },
  fullscreenActionRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  fullscreenActionIcon: {
    width: 44,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  fullscreenTextAction: {
    marginLeft: 16,
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  fullscreenTextActionMuted: {
    marginLeft: 18,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "500",
  },
  iconButton: {
    minWidth: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButton: {
    marginLeft: 2,
    minWidth: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  nextButtonDisabled: {
    opacity: 0.72,
  },
  timeText: {
    width: 88,
    color: "rgba(255,255,255,0.96)",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
  progressTrack: {
    flex: 1,
    height: 28,
    justifyContent: "center",
    marginHorizontal: 8,
  },
  progressTrackBg: {
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: "50%",
    marginTop: -1.5,
    height: 3,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
  progressThumb: {
    position: "absolute",
    top: "50%",
    marginTop: -5,
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
  },
});

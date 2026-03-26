import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import VideoCard from "../components/VideoCard";
import SectionHeader from "../components/SectionHeader";
import { colors, screenStyles } from "../styles/theme";

export default function HomeScreen({
  videos,
  detailLoadingId,
  onOpenVideo,
  sourceName,
  onGoSources,
}) {
  const featuredVideos = videos;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable style={styles.heroCompact} onPress={onGoSources}>
        <View style={styles.heroCompactText}>
          <Text style={styles.heroCompactLabel}>当前源</Text>
          <Text style={styles.heroCompactTitle} numberOfLines={1}>
            {sourceName}
          </Text>
        </View>
        <Text style={styles.heroCompactArrow}>切换</Text>
      </Pressable>

      <SectionHeader title="推荐" desc="" />
      <View style={styles.grid}>
        {featuredVideos.map((item) => (
          <View key={item.id} style={styles.gridCell}>
            <VideoCard item={item} loading={detailLoadingId === item.id} onPress={onOpenVideo} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#d6e8ff",
  },
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 112,
  },
  heroCompact: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  heroCompactText: {
    flex: 1,
  },
  heroCompactLabel: {
    color: "#8a92a1",
    fontSize: 11,
  },
  heroCompactTitle: {
    marginTop: 4,
    color: "#111111",
    fontSize: 15,
    fontWeight: "700",
  },
  heroCompactArrow: {
    color: "#5b6472",
    fontSize: 12,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  gridCell: {
    width: "48.2%",
  },
});

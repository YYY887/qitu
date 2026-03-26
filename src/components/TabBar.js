import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabBar({ tabs, activeTab, onChange }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {tabs.map((item) => {
        const active = item.id === activeTab;
        const icon = item.id === "discover" ? "⌂" : item.id === "sources" ? "◫" : "◎";

        return (
          <Pressable key={item.id} style={styles.item} onPress={() => onChange(item.id)}>
            <Text style={[styles.icon, active && styles.iconActive]}>{icon}</Text>
            <Text style={[styles.text, active && styles.textActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopWidth: 1,
    borderTopColor: "#e6ebf3",
  },
  item: {
    flex: 1,
    minHeight: 46,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  icon: {
    color: "#c4c9d4",
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "700",
  },
  iconActive: {
    color: "#8cabff",
  },
  text: {
    color: "#98a0ae",
    fontSize: 10,
    fontWeight: "600",
  },
  textActive: {
    color: "#8cabff",
  },
});

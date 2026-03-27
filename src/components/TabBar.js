import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTheme } from "../styles/theme";

export default function TabBar({ tabs, activeTab, onChange, colors: themeColors }) {
  const insets = useSafeAreaInsets();
  const colors = themeColors || getTheme("light");

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.tabBg,
          borderTopColor: colors.border,
        },
      ]}
    >
      {tabs.map((item) => {
        const active = item.id === activeTab;
        const iconName =
          item.id === "discover"
            ? active ? "compass" : "compass-outline"
            : item.id === "sources"
              ? active ? "layers" : "layers-outline"
              : active ? "person-circle" : "person-circle-outline";

        return (
          <Pressable key={item.id} style={styles.item} onPress={() => onChange(item.id)}>
            <Ionicons
              name={iconName}
              size={20}
              color={active ? colors.accent : colors.textMuted}
            />
            <Text style={[styles.text, { color: active ? colors.accent : colors.textMuted }]}>{item.label}</Text>
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
    borderTopWidth: 1,
  },
  item: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
  },
  text: {
    fontSize: 10,
    fontWeight: "600",
  },
});

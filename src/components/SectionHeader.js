import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getTheme } from "../styles/theme";

export default function SectionHeader({ title, desc, right, colors: themeColors }) {
  const colors = themeColors || getTheme("light");

  return (
    <View style={styles.wrap}>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {desc ? <Text style={[styles.desc, { color: colors.textMuted }]}>{desc}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  desc: {
    marginTop: 4,
    fontSize: 13,
  },
});

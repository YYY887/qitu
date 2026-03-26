import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../styles/theme";

export default function SectionHeader({ title, desc, right }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {desc ? <Text style={styles.desc}>{desc}</Text> : null}
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
    color: colors.textPrimary,
  },
  desc: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
});

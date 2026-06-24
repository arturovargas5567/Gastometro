import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Category } from "../constants/categories";

interface Props {
  category: Category;
  size?: number;
  iconSize?: number;
}

export const CategoryBadge: React.FC<Props> = ({ category, size = 40, iconSize }) => {
  const iconS = iconSize ?? Math.round(size * 0.55);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: category.color + "22",
        },
      ]}
    >
      <Ionicons name={category.icon} size={iconS} color={category.color} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});

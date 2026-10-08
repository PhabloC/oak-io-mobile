import { View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius } from "./tokens";

export function Card({ children, style, padded = true }) {
  const { colors, shadow } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          boxShadow: shadow.card,
          padding: padded ? 16 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

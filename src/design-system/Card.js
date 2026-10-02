import { View } from "react-native";
import { colors, radius, shadow } from "./tokens";

export function Card({ children, style, padded = true }) {
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

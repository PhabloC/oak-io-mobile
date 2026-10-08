import { Text, TextInput, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { radius } from "./tokens";

export function Field({ label, style, ...props }) {
  const { colors } = useTheme();

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {label ? <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8, fontWeight: "600" }}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: colors.canvas,
          color: colors.ink,
          borderRadius: radius.sm,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
        }}
        {...props}
      />
    </View>
  );
}

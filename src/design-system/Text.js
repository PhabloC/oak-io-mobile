import { Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

export function Title({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[{ color: colors.ink, fontSize: 26, fontWeight: "700" }, style]}>{children}</Text>;
}

export function Subtitle({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[{ color: colors.muted, fontSize: 14, marginTop: 4 }, style]}>{children}</Text>;
}

export function SectionTitle({ children, style }) {
  const { colors } = useTheme();
  return <Text style={[{ color: colors.ink, fontSize: 18, fontWeight: "700" }, style]}>{children}</Text>;
}

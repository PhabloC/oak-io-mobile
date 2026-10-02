import { Text } from "react-native";
import { colors } from "./tokens";

export function Title({ children, style }) {
  return <Text style={[{ color: colors.ink, fontSize: 26, fontWeight: "700" }, style]}>{children}</Text>;
}

export function Subtitle({ children, style }) {
  return <Text style={[{ color: colors.muted, fontSize: 14, marginTop: 4 }, style]}>{children}</Text>;
}

export function SectionTitle({ children, style }) {
  return <Text style={[{ color: colors.ink, fontSize: 18, fontWeight: "700" }, style]}>{children}</Text>;
}

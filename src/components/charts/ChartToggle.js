import { Pressable, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { radius } from "../../design-system";

export default function ChartToggle({ options, value, onChange, accent = "accent" }) {
  const { colors } = useTheme();
  const activeBg = accent === "success" ? colors.success : colors.accent;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              borderRadius: radius.sm,
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: selected ? activeBg : colors.accentSoft,
            }}
          >
            <Text
              style={{
                color: selected ? colors.onAccent : colors.accent,
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

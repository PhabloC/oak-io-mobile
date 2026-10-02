import { Pressable, Text, View } from "react-native";
import { colors, radius, shadow } from "./tokens";

export function PrimaryButton({ label, onPress, icon, disabled = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: "rgba(255,255,255,0.22)", borderless: false }}
      style={({ pressed }) => ({
        width: "100%",
        height: 52,
        borderRadius: 26,
        overflow: "hidden",
        backgroundColor: colors.accent,
        opacity: disabled ? 0.5 : pressed ? 0.92 : 1,
        paddingHorizontal: 18,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        elevation: 2,
      })}
    >
      {icon ? <View style={{ marginRight: 10 }}>{icon}</View> : null}
      <Text style={{ color: colors.onAccent, fontSize: 16, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

export function Pill({ label, selected = false, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: selected ? colors.accent : colors.accentSoft,
        borderRadius: radius.pill,
        paddingHorizontal: 14,
        paddingVertical: 9,
      }}
    >
      {icon}
      <Text style={{ color: selected ? colors.onAccent : colors.accent, fontWeight: "600", fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function ActionTile({ label, onPress, icon, tint = colors.accentSoft }) {
  return (
    <Pressable onPress={onPress} style={{ alignItems: "center", width: 76 }}>
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          backgroundColor: colors.surface,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: shadow.card,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            backgroundColor: tint,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </View>
      </View>
      <Text style={{ marginTop: 8, color: colors.ink, fontSize: 12, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

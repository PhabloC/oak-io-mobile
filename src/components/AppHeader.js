import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export default function AppHeader({ title, showBack = false }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { colors, shadow } = useTheme();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "O";
  const canGoBack = showBack || navigation.canGoBack();

  return (
    <View style={{ marginBottom: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, paddingRight: 12 }}>
        {canGoBack ? (
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              backgroundColor: colors.surface,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              boxShadow: shadow.card,
            }}
          >
            <ChevronLeft color={colors.ink} size={22} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          {title ? (
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700" }}>{title}</Text>
          ) : (
            <>
              <Text style={{ color: colors.muted, fontSize: 13 }}>Olá</Text>
              <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700", marginTop: 2 }}>{user?.name}</Text>
            </>
          )}
        </View>
      </View>
      <Pressable
        onPress={() => navigation.navigate("Main", { screen: "Perfil" })}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.accent,
          alignItems: "center",
          justifyContent: "center",
          boxShadow: shadow.card,
        }}
      >
        <Text style={{ color: colors.onAccent, fontSize: 16, fontWeight: "700" }}>{initial}</Text>
      </Pressable>
    </View>
  );
}

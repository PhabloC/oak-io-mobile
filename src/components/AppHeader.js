import { Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors, shadow } from "../design-system";
import { useAuth } from "../context/AuthContext";

export default function AppHeader() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "O";

  return (
    <View style={{ marginBottom: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <View>
        <Text style={{ color: colors.muted, fontSize: 13 }}>Olá</Text>
        <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700", marginTop: 2 }}>{user?.name}</Text>
      </View>
      <Pressable
        onPress={() => navigation.navigate("Perfil")}
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

import { Image, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Screen from "../components/Screen";
import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "../components/icons/UiIconSvg";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { radius } from "../design-system";

function HeaderButton({ onPress, children, colors }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Pressable>
  );
}

function MenuRow({ icon: Icon, label, onPress, colors, isLast = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 15,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.line,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          backgroundColor: colors.accentSoft,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Icon color={colors.ink} size={18} strokeWidth={2.1} />
      </View>
      <Text style={{ flex: 1, color: colors.ink, fontSize: 15, fontWeight: "600" }}>
        {label}
      </Text>
      <ChevronRightIcon color={colors.muted} size={18} strokeWidth={2.2} />
    </Pressable>
  );
}

function Section({ title, children, colors }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text
        style={{
          color: colors.ink,
          fontSize: 17,
          fontWeight: "700",
          marginBottom: 10,
          paddingHorizontal: 2,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        {children}
      </View>
    </View>
  );
}

export default function PerfilScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { colors } = useTheme();
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "O";

  const handleBack = () => {
    navigation.navigate("Dashboard");
  };

  return (
    <Screen>
      <View
        style={{
          marginTop: 10,
          marginBottom: 22,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <HeaderButton onPress={handleBack} colors={colors}>
          <ChevronLeftIcon color={colors.ink} size={22} strokeWidth={2.2} />
        </HeaderButton>
        <HeaderButton onPress={() => navigation.navigate("Configuracoes")} colors={colors}>
          <SettingsIcon color={colors.ink} size={20} strokeWidth={2.2} />
        </HeaderButton>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 28,
          gap: 14,
        }}
      >
        {user?.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.accentSoft }}
          />
        ) : (
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.onAccent, fontSize: 24, fontWeight: "700" }}>
              {initial}
            </Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700" }}>
            {user?.name || "Usuário"}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14, marginTop: 3 }}>
            {user?.email || "—"}
          </Text>
        </View>
      </View>

      <Section title="Minha conta" colors={colors}>
        <MenuRow
          icon={UserIcon}
          label="Dados pessoais"
          colors={colors}
          onPress={() => navigation.navigate("DadosPessoais")}
        />
        <MenuRow
          icon={BellIcon}
          label="Notificações"
          colors={colors}
          onPress={() => navigation.navigate("Notificacoes")}
        />
        <MenuRow
          icon={SettingsIcon}
          label="Configurações"
          colors={colors}
          isLast
          onPress={() => navigation.navigate("Configuracoes")}
        />
      </Section>

      <Pressable
        onPress={signOut}
        style={{
          marginTop: 4,
          marginBottom: 20,
          height: 52,
          borderRadius: radius.md,
          backgroundColor: colors.tintDanger,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <LogOutIcon color={colors.danger} size={18} strokeWidth={2.2} />
        <Text style={{ color: colors.danger, fontSize: 15, fontWeight: "700" }}>Sair da conta</Text>
      </Pressable>
    </Screen>
  );
}

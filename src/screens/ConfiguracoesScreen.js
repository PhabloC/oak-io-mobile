import { Text, View } from "react-native";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import { MonitorIcon, MoonIcon, SunIcon } from "../components/icons/UiIconSvg";
import { THEME_OPTIONS, useTheme } from "../context/ThemeContext";
import { Pill, Subtitle, Title, radius } from "../design-system";

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

export default function ConfiguracoesScreen() {
  const { preference, setPreference, colors } = useTheme();

  return (
    <Screen>
      <AppHeader onlyBack />
      <Title>Configurações</Title>
      <Subtitle>Ajuste a aparência e preferências do app.</Subtitle>

      <View
        style={{
          marginTop: 22,
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: colors.line,
          padding: 16,
        }}
      >
        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
          Aparência
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13, marginTop: 4, marginBottom: 14 }}>
          Escolha o tema do aplicativo
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {THEME_OPTIONS.map((option) => {
            const Icon = THEME_ICONS[option.value];
            const selected = preference === option.value;
            return (
              <Pill
                key={option.value}
                label={option.label}
                selected={selected}
                onPress={() => setPreference(option.value)}
                icon={<Icon color={selected ? colors.onAccent : colors.accent} size={14} />}
              />
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

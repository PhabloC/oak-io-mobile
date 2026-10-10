import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Field, PrimaryButton, Subtitle, Title, radius } from "../design-system";

export default function DadosPessoaisScreen() {
  const insets = useSafeAreaInsets();
  const { user, updateProfile } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "O";

  useEffect(() => {
    setName(user?.name || "");
  }, [user?.name]);

  const dirty = useMemo(
    () => name.trim() !== String(user?.name || "").trim(),
    [name, user?.name],
  );

  const save = async () => {
    const nextName = name.trim();
    if (!nextName) {
      Alert.alert("Nome obrigatório", "Informe como quer aparecer no app.");
      return;
    }
    if (!dirty) {
      Alert.alert("Sem alterações", "Altere algum dado antes de salvar.");
      return;
    }

    setSaving(true);
    const result = await updateProfile({ name: nextName });
    setSaving(false);

    if (result?.error) {
      Alert.alert("Erro", "Não foi possível salvar seus dados. Tente novamente.");
      return;
    }

    Alert.alert("Pronto", "Dados pessoais atualizados.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <Screen>
        <AppHeader onlyBack />
        <Title>Dados pessoais</Title>
        <Subtitle>Edite suas informações e salve as alterações.</Subtitle>

        <View
          style={{
            marginTop: 22,
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.line,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 18 }}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: colors.accentSoft,
                }}
              />
            ) : (
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  backgroundColor: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.onAccent, fontSize: 30, fontWeight: "700" }}>
                  {initial}
                </Text>
              </View>
            )}
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 10, textAlign: "center" }}>
              Foto sincronizada com sua conta Google
            </Text>
          </View>

          <Field
            label="Nome de exibição"
            value={name}
            onChangeText={setName}
            placeholder="Seu nome"
            autoCapitalize="words"
            maxLength={80}
          />
          <Field
            label="E-mail"
            value={user?.email || ""}
            editable={false}
            inputStyle={{ color: colors.muted }}
          />
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: -4, lineHeight: 17 }}>
            O e-mail vem da conta Google e não pode ser alterado por aqui.
          </Text>
        </View>
      </Screen>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16),
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.line,
          alignItems: "center",
        }}
      >
        <PrimaryButton
          label={saving ? "Salvando..." : "Salvar alterações"}
          onPress={save}
          disabled={saving || !dirty}
          style={{ width: 240 }}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

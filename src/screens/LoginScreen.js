import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, PrimaryButton, colors } from "../design-system";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setBusy(true);
      setError("");
      await signIn();
    } catch (err) {
      setError(err?.message || "Não foi possível entrar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
        <Card style={{ paddingVertical: 32, paddingHorizontal: 22, borderRadius: 32 }}>
          <Image
            source={require("../../public/logo_app.png")}
            style={{ height: 88, width: 88, alignSelf: "center", borderRadius: 44 }}
            resizeMode="cover"
          />
          <Text style={{ marginTop: 20, textAlign: "center", fontSize: 28, fontWeight: "700", color: colors.ink }}>
            Bem-vindo
          </Text>
          <Text style={{ marginTop: 8, textAlign: "center", fontSize: 15, lineHeight: 22, color: colors.muted }}>
            Gerencie suas finanças com simplicidade e segurança. Bem-vindo à sua jornada de controle financeiro!
          </Text>
          <View style={{ marginTop: 28 }}>
            <PrimaryButton
              label={busy ? "Entrando..." : "Login com Google"}
              disabled={busy}
              onPress={handleLogin}
              icon={
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Image
                    source={require("../../assets/google.png")}
                    style={{ width: 16, height: 16 }}
                    resizeMode="contain"
                  />
                </View>
              }
            />
          </View>
          {error ? (
            <Text style={{ marginTop: 16, textAlign: "center", fontSize: 13, color: colors.danger }}>{error}</Text>
          ) : null}
          <Text style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: colors.muted }}>
            © {new Date().getFullYear()} Todos os direitos reservados. Phablo Carvalho
          </Text>
        </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

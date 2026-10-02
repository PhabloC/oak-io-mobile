import { useState } from "react";
import { Text, View } from "react-native";
import { LogOut } from "lucide-react-native";
import Screen from "../components/Screen";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { formatBRL } from "../utils/format";
import { Card, Field, PrimaryButton, colors } from "../design-system";

export default function PerfilScreen() {
  const { user, signOut, updateProfile } = useAuth();
  const { assets } = useFinance();
  const [name, setName] = useState(user?.name || "");
  const [message, setMessage] = useState("");
  const patrimonio = assets.reduce((acc, asset) => acc + asset.current, 0);

  const save = () => {
    const nextName = name.trim();
    if (!nextName) return;
    updateProfile(nextName);
    setMessage("Perfil atualizado.");
  };

  return (
    <Screen>
      <Card style={{ alignItems: "center", paddingVertical: 28 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.onAccent, fontSize: 28, fontWeight: "700" }}>{user?.name?.charAt(0)}</Text>
        </View>
        <Text style={{ marginTop: 14, color: colors.ink, fontSize: 24, fontWeight: "700" }}>{user?.name}</Text>
        <Text style={{ marginTop: 4, color: colors.muted }}>{user?.email}</Text>
        <Text style={{ marginTop: 12, color: colors.accent, fontWeight: "700" }}>Patrimônio {formatBRL(patrimonio)}</Text>
      </Card>
      <Card style={{ marginTop: 16 }}>
        <Field label="Nome de exibição" value={name} onChangeText={setName} />
        <PrimaryButton label="Salvar" onPress={save} />
        {message ? <Text style={{ marginTop: 10, color: colors.accent, fontSize: 12 }}>{message}</Text> : null}
      </Card>
      <View style={{ marginTop: 16 }}>
        <PrimaryButton label="Sair" onPress={signOut} icon={<LogOut color="#fff" size={18} />} />
      </View>
    </Screen>
  );
}

import { useState } from "react";
import { Modal, Text, View } from "react-native";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import { useFinance } from "../context/FinanceContext";
import { formatBRL } from "../utils/format";
import { Card, Field, Pill, PrimaryButton } from "../design-system";
import { useTheme } from "../context/ThemeContext";

const TYPES = ["Renda fixa", "Ações", "FIIs", "ETF", "Cripto"];

export default function InvestimentoScreen() {
  const { colors } = useTheme();
  const { assets, addAsset } = useFinance();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [value, setValue] = useState("");
  const invested = assets.reduce((acc, asset) => acc + asset.invested, 0);
  const current = assets.reduce((acc, asset) => acc + asset.current, 0);
  const result = current - invested;

  const save = () => {
    const amount = Number(String(value).replace(",", "."));
    if (!name.trim() || !amount) return;
    addAsset({ name: name.trim(), type, invested: amount, current: amount });
    setName("");
    setValue("");
    setOpen(false);
  };

  return (
    <Screen>
      <AppHeader title="Investimentos" showBack />
      <View style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
        <Pill label="Ativo" selected onPress={() => setOpen(true)} />
      </View>
      <Card style={{ marginBottom: 12, backgroundColor: colors.accent }}>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Patrimônio investido</Text>
        <Text style={{ marginTop: 6, color: colors.onAccent, fontSize: 28, fontWeight: "700" }}>{formatBRL(current)}</Text>
        <Text style={{ marginTop: 8, color: result >= 0 ? "#C8F5DE" : "#FFD0D6", fontWeight: "600" }}>
          {result >= 0 ? "+" : "-"} {formatBRL(result)} neste período
        </Text>
      </Card>
      {assets.map((asset) => {
        const profit = asset.current - asset.invested;
        return (
          <Card key={asset.id} style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "700" }}>{asset.name}</Text>
            <Text style={{ color: colors.accent, fontSize: 12, marginTop: 2 }}>{asset.type}</Text>
            <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: colors.muted }}>Atual {formatBRL(asset.current)}</Text>
              <Text style={{ color: profit >= 0 ? colors.success : colors.danger, fontWeight: "700" }}>
                {profit >= 0 ? "+" : "-"} {formatBRL(profit)}
              </Text>
            </View>
          </Card>
        );
      })}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(28, 27, 41, 0.4)" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingBottom: 32 }}>
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700", marginBottom: 14 }}>Cadastrar ativo</Text>
            <Field placeholder="Nome do ativo" value={name} onChangeText={setName} />
            <View style={{ marginBottom: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TYPES.map((item) => (
                <Pill key={item} label={item} selected={type === item} onPress={() => setType(item)} />
              ))}
            </View>
            <Field placeholder="Valor aportado" value={value} onChangeText={setValue} keyboardType="decimal-pad" />
            <PrimaryButton label="Salvar ativo" onPress={save} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

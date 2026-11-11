import { useEffect, useState } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import { Field, Pill, PrimaryButton } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { TIPOS_ATIVO } from "../../utils/investimento";
import SheetShell from "./SheetShell";

export default function EditarAtivoSheet({ visible, ativo, onClose, onSave }) {
  const { colors } = useTheme();
  const [nome, setNome] = useState("");
  const [ticker, setTicker] = useState("");
  const [tipo, setTipo] = useState("acoes");
  const [emergencia, setEmergencia] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !ativo) return;
    setNome(ativo.nome || "");
    setTicker(ativo.ticker || "");
    setTipo(ativo.tipo || "acoes");
    setEmergencia(ativo.emergencia === true);
    setSaving(false);
  }, [visible, ativo]);

  const handleSave = async () => {
    if (!nome.trim()) {
      Alert.alert("Atenção", "Informe o nome do ativo.");
      return;
    }
    setSaving(true);
    const result = await onSave({
      nome: nome.trim(),
      ticker: ticker.trim() || null,
      tipo,
      emergencia,
    });
    setSaving(false);
    if (result?.error) {
      Alert.alert("Erro", "Não foi possível atualizar o ativo.");
      return;
    }
    onClose();
  };

  return (
    <SheetShell visible={visible} title="Editar ativo" onClose={onClose}>
      <Field placeholder="Nome do ativo" value={nome} onChangeText={setNome} />
      <Field placeholder="Ticker (opcional)" value={ticker} onChangeText={setTicker} />
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>Tipo</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {TIPOS_ATIVO.map((item) => (
          <Pill
            key={item.value}
            label={item.label}
            selected={tipo === item.value}
            onPress={() => setTipo(item.value)}
          />
        ))}
      </View>
      <Pressable
        onPress={() => setEmergencia((current) => !current)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 14,
          borderRadius: 16,
          backgroundColor: emergencia ? colors.tintWarning : colors.canvas,
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>Reserva de emergência</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
            Incluir este ativo no cálculo da reserva
          </Text>
        </View>
        <Switch value={emergencia} onValueChange={setEmergencia} />
      </Pressable>
      <PrimaryButton
        label={saving ? "Salvando..." : "Salvar alterações"}
        onPress={handleSave}
        disabled={saving}
      />
    </SheetShell>
  );
}

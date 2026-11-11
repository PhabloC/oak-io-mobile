import { useEffect, useState } from "react";
import { Alert, Text } from "react-native";
import { Field, PrimaryButton } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";
import { formatInputCurrency, parseCurrencyToNumber } from "../../utils/investimento";
import SheetShell from "./SheetShell";

export default function EditarValorSheet({ visible, ativo, onClose, onSave }) {
  const { colors } = useTheme();
  const [valor, setValor] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !ativo) return;
    const current = Number(ativo.valor_atual || 0);
    setValor(
      current > 0
        ? current.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "",
    );
    setSaving(false);
  }, [visible, ativo]);

  const handleSave = async () => {
    const novoValor = parseCurrencyToNumber(valor);
    if (novoValor < 0) {
      Alert.alert("Atenção", "Informe um valor válido.");
      return;
    }
    setSaving(true);
    const result = await onSave(novoValor);
    setSaving(false);
    if (result?.error) {
      Alert.alert("Erro", "Não foi possível atualizar o valor.");
      return;
    }
    onClose();
  };

  if (!ativo) return null;

  return (
    <SheetShell visible={visible} title="Valor na corretora" onClose={onClose}>
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 4 }}>
        {ativo.nome}
      </Text>
      <Text style={{ color: colors.ink, fontSize: 13, marginBottom: 12 }}>
        Total investido: {formatBRL(ativo.valor_investido)}
      </Text>
      <Field
        placeholder="Valor atual na carteira"
        value={valor}
        onChangeText={(value) => setValor(formatInputCurrency(value))}
        keyboardType="number-pad"
      />
      <PrimaryButton
        label={saving ? "Salvando..." : "Atualizar valor"}
        onPress={handleSave}
        disabled={saving}
      />
    </SheetShell>
  );
}

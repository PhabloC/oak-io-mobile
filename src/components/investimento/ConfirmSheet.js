import { Text, View } from "react-native";
import { PrimaryButton, Pill } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";
import SheetShell from "./SheetShell";

export default function ConfirmSheet({
  visible,
  title,
  description,
  confirmLabel = "Confirmar",
  confirmTone = "danger",
  ativo,
  onClose,
  onConfirm,
  loading = false,
}) {
  const { colors } = useTheme();
  const confirmColor = confirmTone === "warning" ? "#D97706" : colors.danger;

  return (
    <SheetShell visible={visible} title={title} onClose={onClose}>
      <Text style={{ color: colors.muted, marginBottom: 14, lineHeight: 20 }}>
        {description}
      </Text>
      {ativo ? (
        <View
          style={{
            backgroundColor: colors.canvas,
            borderRadius: 14,
            padding: 12,
            marginBottom: 16,
            gap: 6,
          }}
        >
          <Text style={{ color: colors.ink, fontWeight: "700" }}>{ativo.nome}</Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            Investido: {formatBRL(ativo.valor_investido)}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            Mercado: {formatBRL(ativo.valor_atual)}
          </Text>
        </View>
      ) : null}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Pill label="Cancelar" selected={false} onPress={onClose} />
        </View>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label={loading ? "Aguarde..." : confirmLabel}
            onPress={onConfirm}
            disabled={loading}
            style={{ backgroundColor: confirmColor }}
          />
        </View>
      </View>
    </SheetShell>
  );
}

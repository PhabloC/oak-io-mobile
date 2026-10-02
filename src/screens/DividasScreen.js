import { useState } from "react";
import { Modal, Text, View } from "react-native";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import { useFinance } from "../context/FinanceContext";
import { formatBRL } from "../utils/format";
import { Card, Field, Pill, PrimaryButton, Title, colors } from "../design-system";

export default function DividasScreen() {
  const { debts, addDebt, payDebt } = useFinance();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [total, setTotal] = useState("");

  const totalDividas = debts.reduce((acc, debt) => acc + debt.total, 0);
  const totalPago = debts.reduce((acc, debt) => acc + debt.paid, 0);
  const restante = totalDividas - totalPago;
  const cards = [
    { label: "Total de dívidas", value: totalDividas, color: colors.danger },
    { label: "Restante a pagar", value: restante, color: colors.warning },
    { label: "Total pago", value: totalPago, color: colors.success },
  ];

  const save = () => {
    const amount = Number(String(total).replace(",", "."));
    if (!name.trim() || !amount) return;
    addDebt({ name: name.trim(), total: amount, paid: 0 });
    setName("");
    setTotal("");
    setOpen(false);
  };

  return (
    <Screen>
      <AppHeader />
      <View style={{ marginBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Title>Dívidas</Title>
        <Pill label="Nova" selected onPress={() => setOpen(true)} />
      </View>
      {cards.map((card) => (
        <Card key={card.label} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>{card.label}</Text>
          <Text style={{ marginTop: 6, color: card.color, fontSize: 22, fontWeight: "700" }}>{formatBRL(card.value)}</Text>
        </Card>
      ))}
      {debts.map((debt) => {
        const pending = Math.max(debt.total - debt.paid, 0);
        return (
          <Card key={debt.id} style={{ marginBottom: 12 }}>
            <Text style={{ color: colors.ink, fontSize: 17, fontWeight: "700" }}>{debt.name}</Text>
            <Text style={{ marginTop: 6, color: colors.muted }}>
              Pago {formatBRL(debt.paid)} · Restante {formatBRL(pending)}
            </Text>
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                label={pending === 0 ? "Quitada" : "Pagar R$ 100,00"}
                disabled={pending === 0}
                onPress={() => payDebt(debt.id, Math.min(100, pending))}
              />
            </View>
          </Card>
        );
      })}
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(28, 27, 41, 0.4)" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, paddingBottom: 32 }}>
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: "700", marginBottom: 14 }}>Nova dívida</Text>
            <Field placeholder="Nome" value={name} onChangeText={setName} />
            <Field placeholder="Valor total" value={total} onChangeText={setTotal} keyboardType="decimal-pad" />
            <PrimaryButton label="Salvar dívida" onPress={save} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

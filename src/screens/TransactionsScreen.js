import { useState } from "react";
import { Text, View } from "react-native";
import { Plus } from "lucide-react-native";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import TransactionForm from "../components/TransactionForm";
import { useFinance } from "../context/FinanceContext";
import { signedAmount } from "../utils/format";
import { Card, Pill, PrimaryButton, Subtitle, Title, colors, toneColor } from "../design-system";

const FILTERS = ["Todas", "Ganho", "Gasto", "Investimento"];

export default function TransactionsScreen() {
  const { transactions, selectedMonth } = useFinance();
  const [filter, setFilter] = useState("Todas");
  const [formOpen, setFormOpen] = useState(false);
  const visible = transactions.filter((item) => filter === "Todas" || item.type === filter);

  return (
    <Screen>
      <AppHeader />
      <Title>Transações</Title>
      <Subtitle>Novas entradas entram em {selectedMonth}</Subtitle>
      <View style={{ marginTop: 16, marginBottom: 14, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {FILTERS.map((item) => (
          <Pill key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />
        ))}
      </View>
      <PrimaryButton label="Adicionar transação" onPress={() => setFormOpen(true)} icon={<Plus color="#fff" size={18} />} />
      <View style={{ height: 16 }} />
      {visible.map((item) => (
        <Card key={item.id} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ flex: 1, paddingRight: 12, color: colors.ink, fontWeight: "600" }}>{item.title}</Text>
            <Text style={{ color: toneColor(item.type), fontWeight: "700" }}>{signedAmount(item.type, item.value)}</Text>
          </View>
          <Text style={{ marginTop: 6, color: colors.muted, fontSize: 12 }}>
            {item.type} · {item.category} · {item.month}
          </Text>
        </Card>
      ))}
      <TransactionForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </Screen>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import MonthPills from "../components/MonthPills";
import { PlusIcon } from "../components/icons/UiIconSvg";
import TransactionForm from "../components/TransactionForm";
import TransactionTypeIcon from "../components/TransactionTypeIcon";
import { useFinance } from "../context/FinanceContext";
import { signedAmount } from "../utils/format";
import { currentMonthName, transactionMatchesMonth } from "../utils/transactions";
import { Card, Pill, Subtitle, Title } from "../design-system";
import { useTheme } from "../context/ThemeContext";

const FILTERS = ["Todas", "Ganho", "Gasto", "Investimento"];

function resolveFilter(value) {
  return FILTERS.includes(value) ? value : "Todas";
}

export default function TransactionsScreen() {
  const route = useRoute();
  const { colors, toneColor, shadow } = useTheme();
  const { transactions, months } = useFinance();
  const [monthFilter, setMonthFilter] = useState(currentMonthName);
  const [filter, setFilter] = useState(() => resolveFilter(route.params?.filter));
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    setFilter(resolveFilter(route.params?.filter));
  }, [route.params?.filter]);

  useFocusEffect(
    useCallback(() => {
      setMonthFilter(currentMonthName());
    }, []),
  );

  const visible = useMemo(
    () =>
      transactions.filter(
        (item) =>
          transactionMatchesMonth(item, monthFilter) &&
          (filter === "Todas" || item.type === filter),
      ),
    [transactions, monthFilter, filter],
  );

  return (
    <Screen>
      <AppHeader onlyBack />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Title>Transações</Title>
          <Subtitle>Filtrado por {monthFilter}</Subtitle>
        </View>

        <Pressable
          onPress={() => setFormOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Adicionar transação"
          style={{
            height: 44,
            borderRadius: 22,
            paddingHorizontal: 16,
            backgroundColor: colors.accent,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            boxShadow: shadow.card,
          }}
        >
          <PlusIcon color={colors.onAccent} size={18} strokeWidth={2.4} />
          <Text style={{ color: colors.onAccent, fontSize: 14, fontWeight: "700" }}>Adicionar</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: 16 }}>
        <MonthPills months={months} selectedMonth={monthFilter} onSelect={setMonthFilter} />
      </View>

      <View style={{ marginBottom: 16, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {FILTERS.map((item) => (
          <Pill key={item} label={item} selected={filter === item} onPress={() => setFilter(item)} />
        ))}
      </View>

      {visible.length === 0 ? (
        <Text style={{ color: colors.muted, textAlign: "center", paddingVertical: 28 }}>
          Nenhuma transação em {monthFilter}.
        </Text>
      ) : (
        visible.map((item) => (
          <Card key={item.id} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ marginRight: 12 }}>
                <TransactionTypeIcon type={item.type} category={item.category} />
              </View>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ color: colors.ink, fontWeight: "600" }}>{item.title}</Text>
                <Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>
                  {item.type} · {item.category} · {item.month}
                </Text>
              </View>
              <Text style={{ color: toneColor(item.type), fontWeight: "700" }}>
                {signedAmount(item.type, item.value)}
              </Text>
            </View>
          </Card>
        ))
      )}

      <TransactionForm visible={formOpen} onClose={() => setFormOpen(false)} />
    </Screen>
  );
}

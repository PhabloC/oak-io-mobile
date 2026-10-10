import { useMemo } from "react";
import { Text, View } from "react-native";
import { Card } from "../design-system";
import { useTheme } from "../context/ThemeContext";
import { formatBRL } from "../utils/format";
import { getComparativoGastos, getTopGastoCategories } from "../utils/insights";
import TransactionTypeIcon from "./TransactionTypeIcon";

function ComparativoText({ comparativo, selectedMonth, colors }) {
  if (comparativo.kind === "cross_year") {
    return (
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
        Para comparar {selectedMonth} com {comparativo.prevMonth}, os dados de{" "}
        <Text style={{ color: colors.accent, fontWeight: "600" }}>{comparativo.prevYear}</Text>{" "}
        precisam estar carregados.
      </Text>
    );
  }

  if (comparativo.gastosAnterior === 0 && comparativo.gastosAtual === 0) {
    return (
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
        Sem gastos registrados neste mês nem em {comparativo.prevMonth}.
      </Text>
    );
  }

  if (comparativo.gastosAnterior === 0 && comparativo.gastosAtual > 0) {
    return (
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
        Gastos atuais:{" "}
        <Text style={{ color: colors.ink, fontWeight: "600" }}>
          {formatBRL(comparativo.gastosAtual)}
        </Text>
        . Em {comparativo.prevMonth} não houve gastos registrados.
      </Text>
    );
  }

  let trend = null;
  if (comparativo.pct > 0) {
    trend = (
      <Text style={{ color: "#F59E0B", fontWeight: "700" }}>
        {Math.abs(comparativo.pct).toFixed(0)}% acima
      </Text>
    );
  } else if (comparativo.pct < 0) {
    trend = (
      <Text style={{ color: colors.success, fontWeight: "700" }}>
        {Math.abs(comparativo.pct).toFixed(0)}% abaixo
      </Text>
    );
  }

  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
        Em {comparativo.prevMonth}:{" "}
        <Text style={{ color: colors.ink }}>{formatBRL(comparativo.gastosAnterior)}</Text>
        . Agora:{" "}
        <Text style={{ color: colors.ink, fontWeight: "600" }}>
          {formatBRL(comparativo.gastosAtual)}
        </Text>
        .
      </Text>
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
        {trend ? (
          <>
            {trend} do mês anterior.
          </>
        ) : (
          "Igual ao mês anterior em valor total."
        )}
      </Text>
    </View>
  );
}

export default function DashboardInsights({
  selectedMonth,
  selectedYear,
  transactions = [],
  monthTransactions = [],
}) {
  const { colors } = useTheme();

  const topGastoCategories = useMemo(
    () => getTopGastoCategories(monthTransactions, 3),
    [monthTransactions],
  );

  const comparativo = useMemo(
    () =>
      getComparativoGastos({
        monthTransactions,
        transactions,
        selectedMonth,
        selectedYear,
      }),
    [monthTransactions, transactions, selectedMonth, selectedYear],
  );

  return (
    <Card style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "700", marginBottom: 12 }}>
        Top 3 categorias de gasto
      </Text>

      {topGastoCategories.length === 0 ? (
        <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 19 }}>
          Nenhum gasto neste mês para agrupar por categoria.
        </Text>
      ) : (
        <View style={{ gap: 8 }}>
          {topGastoCategories.map(([cat, total], index) => (
            <View
              key={cat}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingVertical: 8,
                paddingHorizontal: 10,
                borderRadius: 12,
                backgroundColor: colors.canvas,
                borderWidth: 1,
                borderColor: colors.line,
              }}
            >
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "700", width: 18 }}>
                {index + 1}.
              </Text>
              <TransactionTypeIcon type="Gasto" category={cat} size={32} />
              <Text
                style={{ color: colors.ink, fontSize: 14, fontWeight: "600", flex: 1 }}
                numberOfLines={1}
              >
                {cat}
              </Text>
              <Text style={{ color: colors.danger, fontSize: 13, fontWeight: "700" }}>
                {formatBRL(total)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View
        style={{
          height: 1,
          backgroundColor: colors.line,
          marginVertical: 16,
        }}
      />

      <Text style={{ color: colors.ink, fontSize: 15, fontWeight: "700", marginBottom: 10 }}>
        Gastos vs. mês anterior
      </Text>
      <ComparativoText
        comparativo={comparativo}
        selectedMonth={selectedMonth}
        colors={colors}
      />
    </Card>
  );
}

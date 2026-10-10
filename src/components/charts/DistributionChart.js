import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { TrendingUpIcon } from "../icons/UiIconSvg";
import { Card } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";
import { buildDistributionData } from "../../utils/chartData";
import ChartToggle from "./ChartToggle";

const VIEW_OPTIONS = [
  { label: "Mês", value: "month" },
  { label: "Todos", value: "all" },
];

export default function DistributionChart({
  selectedMonth,
  selectedYear,
  transactions = [],
}) {
  const { colors } = useTheme();
  const [viewMode, setViewMode] = useState("month");

  const chartData = useMemo(
    () =>
      buildDistributionData({
        transactions,
        selectedMonth,
        viewMode,
      }),
    [transactions, selectedMonth, viewMode],
  );

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const pieData = chartData.map((item) => ({
    value: item.value,
    color: item.color,
    text: total > 0 ? `${Math.round((item.value / total) * 100)}%` : "",
  }));

  const title =
    viewMode === "month" ? `Distribuição de ${selectedMonth}` : "Distribuição Geral";
  const subtitle =
    viewMode === "month"
      ? `${selectedMonth} · ${selectedYear}`
      : `Total geral · ${selectedYear}`;
  const trendText =
    total > 0
      ? `Total de ${formatBRL(total)} no período`
      : "Adicione transações para ver a distribuição";

  return (
    <Card style={{ marginBottom: 14 }}>
      <View style={{ gap: 10 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>{title}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{subtitle}</Text>
        </View>
        <ChartToggle options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />

        {chartData.length === 0 ? (
          <View style={{ height: 180, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              Nenhuma transação encontrada
            </Text>
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 8 }}>
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={58}
              innerCircleColor={colors.surface}
              centerLabelComponent={() => (
                <View style={{ alignItems: "center" }}>
                  <Text style={{ color: colors.muted, fontSize: 11 }}>Total</Text>
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 13,
                      fontWeight: "700",
                      marginTop: 2,
                      textAlign: "center",
                      maxWidth: 100,
                    }}
                    numberOfLines={2}
                  >
                    {formatBRL(total)}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        <View style={{ gap: 8 }}>
          {chartData.map((item) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <View
                key={item.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: item.color,
                    }}
                  />
                  <Text style={{ color: colors.ink, fontSize: 13, fontWeight: "600" }}>
                    {item.label}
                  </Text>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>{percent}%</Text>
                </View>
                <Text style={{ color: colors.ink, fontSize: 13, fontWeight: "600" }}>
                  {formatBRL(item.value)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 }}>
          <TrendingUpIcon color={colors.accent} size={16} strokeWidth={2.2} />
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "600", flex: 1 }}>
            {trendText}
          </Text>
        </View>
        <Text style={{ color: colors.muted, fontSize: 11 }}>
          {viewMode === "month"
            ? `Mostrando transações de ${selectedMonth}`
            : "Mostrando total de todas as transações"}
        </Text>
      </View>
    </Card>
  );
}

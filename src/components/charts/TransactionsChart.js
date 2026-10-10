import { useMemo, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { BarChart, LineChart } from "react-native-gifted-charts";
import { Card } from "../../design-system";
import { TrendingDownIcon, TrendingUpIcon } from "../icons/UiIconSvg";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";
import { buildTransactionsSeries, CHART_COLORS } from "../../utils/chartData";
import ChartToggle from "./ChartToggle";

const VIEW_OPTIONS = [
  { label: "Mês", value: "month" },
  { label: "Todos", value: "all" },
];

const TYPE_OPTIONS = [
  { label: "Barras", value: "bar" },
  { label: "Linha", value: "line" },
  { label: "Área", value: "area" },
];

function LegendDot({ color, label }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

export default function TransactionsChart({
  selectedMonth,
  selectedYear,
  transactions = [],
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState("month");
  const [chartType, setChartType] = useState("bar");

  const series = useMemo(
    () =>
      buildTransactionsSeries({
        transactions,
        selectedMonth,
        selectedYear,
        viewMode,
      }),
    [transactions, selectedMonth, selectedYear, viewMode],
  );

  const totals = useMemo(() => {
    const receita = series.reduce((acc, item) => acc + item.receita, 0);
    const despesa = series.reduce((acc, item) => acc + item.despesa, 0);
    const investimento = series.reduce((acc, item) => acc + item.investimento, 0);
    return {
      receita,
      despesa,
      investimento,
      saldo: receita - despesa - investimento,
    };
  }, [series]);

  const chartWidth = Math.max(width - 72, 280);
  const spacing = viewMode === "month" ? 10 : 18;
  const barWidth = viewMode === "month" ? 8 : 14;

  const barData = useMemo(
    () =>
      series.map((item, index) => {
        const showLabel =
          viewMode === "all" || index % 5 === 0 || index === series.length - 1;
        return {
          stacks: [
            { value: item.receita, color: CHART_COLORS.receita },
            { value: item.despesa, color: CHART_COLORS.despesa },
            { value: item.investimento, color: CHART_COLORS.investimento },
          ],
          label: showLabel ? item.label : "",
          spacing,
          labelTextStyle: { color: colors.muted, fontSize: 10 },
        };
      }),
    [series, viewMode, colors.muted, spacing],
  );

  const lineSets = useMemo(
    () => ({
      receita: series.map((item, index) => ({
        value: item.receita,
        label:
          viewMode === "all" || index % 5 === 0 || index === series.length - 1
            ? item.label
            : "",
        labelTextStyle: { color: colors.muted, fontSize: 10 },
      })),
      despesa: series.map((item) => ({ value: item.despesa })),
      investimento: series.map((item) => ({ value: item.investimento })),
    }),
    [series, viewMode, colors.muted],
  );

  const hasValues = series.some(
    (item) => item.receita > 0 || item.despesa > 0 || item.investimento > 0,
  );

  const title =
    viewMode === "month" ? `Transações de ${selectedMonth}` : "Transações por Mês";
  const subtitle =
    viewMode === "month"
      ? `${selectedMonth} · ${selectedYear}`
      : `${selectedYear} · Receita vs Despesa`;
  const trendText =
    totals.saldo >= 0
      ? `Saldo positivo de ${formatBRL(totals.saldo)} no período`
      : `Saldo negativo de ${formatBRL(Math.abs(totals.saldo))} no período`;

  return (
    <Card style={{ marginBottom: 14 }}>
      <View style={{ gap: 10 }}>
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>{title}</Text>
          <Text style={{ color: colors.muted, fontSize: 12 }}>{subtitle}</Text>
        </View>

        <ChartToggle options={VIEW_OPTIONS} value={viewMode} onChange={setViewMode} />
        <ChartToggle
          options={TYPE_OPTIONS}
          value={chartType}
          onChange={setChartType}
          accent="success"
        />

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 2 }}>
          <LegendDot color={CHART_COLORS.receita} label="Receita" />
          <LegendDot color={CHART_COLORS.despesa} label="Despesa" />
          <LegendDot color={CHART_COLORS.investimento} label="Investimento" />
        </View>

        {!hasValues ? (
          <View style={{ height: 180, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              Nenhuma transação no período
            </Text>
          </View>
        ) : chartType === "bar" ? (
          <BarChart
            stackData={barData}
            width={chartWidth}
            height={200}
            barWidth={barWidth}
            spacing={spacing}
            noOfSections={4}
            rulesColor={colors.line}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
            yAxisLabelWidth={42}
            isAnimated
            animationDuration={600}
          />
        ) : (
          <LineChart
            data={lineSets.receita}
            data2={lineSets.despesa}
            data3={lineSets.investimento}
            height={200}
            width={chartWidth}
            spacing={viewMode === "month" ? 14 : 28}
            color1={CHART_COLORS.receita}
            color2={CHART_COLORS.despesa}
            color3={CHART_COLORS.investimento}
            startFillColor1={CHART_COLORS.receita}
            startFillColor2={CHART_COLORS.despesa}
            startFillColor3={CHART_COLORS.investimento}
            endFillColor1={CHART_COLORS.receita}
            endFillColor2={CHART_COLORS.despesa}
            endFillColor3={CHART_COLORS.investimento}
            startOpacity={chartType === "area" ? 0.35 : 0}
            endOpacity={chartType === "area" ? 0.05 : 0}
            areaChart={chartType === "area"}
            thickness={2}
            hideDataPoints
            noOfSections={4}
            rulesColor={colors.line}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
            yAxisLabelWidth={42}
            curved
            isAnimated
            animationDuration={600}
          />
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          {totals.saldo >= 0 ? (
            <TrendingUpIcon color={colors.accent} size={16} strokeWidth={2.2} />
          ) : (
            <TrendingDownIcon color={colors.danger} size={16} strokeWidth={2.2} />
          )}
          <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "600", flex: 1 }}>
            {trendText}
          </Text>
        </View>
      </View>
    </Card>
  );
}

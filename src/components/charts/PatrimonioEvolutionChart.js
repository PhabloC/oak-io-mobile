import { useMemo } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Card } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";
import { mesIndex } from "../../utils/investimento";

export default function PatrimonioEvolutionChart({ historico = [] }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const sorted = useMemo(
    () =>
      [...historico].sort((a, b) => {
        const valueA = (a.ano || 0) * 12 + mesIndex(a.mes);
        const valueB = (b.ano || 0) * 12 + mesIndex(b.mes);
        return valueA - valueB;
      }),
    [historico],
  );

  const data = sorted.map((item) => ({
    value: Number(item.total_patrimonio || 0),
    label: `${String(item.mes || "").slice(0, 3)}/${String(item.ano || "").slice(2)}`,
  }));

  const chartWidth = Math.max(width - 80, data.length * 56);

  return (
    <Card style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
        Evolução patrimonial
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2, marginBottom: 10 }}>
        Snapshots mensais do patrimônio
      </Text>

      {data.length === 0 ? (
        <View style={{ height: 160, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: "center" }}>
            Registre um snapshot para acompanhar a evolução
          </Text>
        </View>
      ) : (
        <View style={{ overflow: "hidden" }}>
          <LineChart
            data={data}
            width={chartWidth}
            height={180}
            color={colors.accent}
            thickness={3}
            startFillColor={colors.accent}
            endFillColor={colors.accent}
            startOpacity={0.25}
            endOpacity={0.02}
            areaChart
            hideDataPoints={data.length > 8}
            dataPointsColor={colors.accent}
            yAxisColor={colors.line}
            xAxisColor={colors.line}
            yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.muted, fontSize: 10 }}
            noOfSections={4}
            rulesColor={colors.line}
            formatYLabel={(value) => {
              const amount = Number(value) || 0;
              if (amount >= 1000) return `${(amount / 1000).toFixed(0)}k`;
              return String(Math.round(amount));
            }}
          />
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 8 }}>
            Último registro: {sorted[sorted.length - 1]?.mes} / {sorted[sorted.length - 1]?.ano} ·{" "}
            {formatBRL(sorted[sorted.length - 1]?.total_patrimonio)}
          </Text>
        </View>
      )}
    </Card>
  );
}

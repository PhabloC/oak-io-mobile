import { useMemo } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Card } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";

export default function CarteiraDailyChart({ historico = [] }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  const data = useMemo(
    () =>
      (historico || []).map((item) => {
        const date = String(item.snapshot_date || "").slice(0, 10);
        const [, m, d] = date.split("-");
        return {
          value: Number(item.patrimonio_total || 0),
          label: m && d ? `${d}/${m}` : date,
        };
      }),
    [historico],
  );

  const chartWidth = Math.max(width - 80, data.length * 40);

  return (
    <Card style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
        Histórico diário
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2, marginBottom: 10 }}>
        Snapshots automáticos pós-pregão
      </Text>

      {data.length === 0 ? (
        <View style={{ height: 140, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: "center" }}>
            Ainda sem histórico diário. Toque em Cotações ou aguarde o cron.
          </Text>
        </View>
      ) : (
        <LineChart
          data={data}
          width={chartWidth}
          height={160}
          color={colors.success}
          thickness={2}
          startFillColor={colors.success}
          endFillColor={colors.canvas}
          startOpacity={0.25}
          endOpacity={0.02}
          areaChart
          hideDataPoints={data.length > 20}
          yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: colors.muted, fontSize: 9 }}
          rulesColor={colors.line}
          noOfSections={4}
          yAxisLabelPrefix="R$"
          formatYLabel={(v) => formatBRL(Number(v)).replace("R$", "").trim()}
        />
      )}
    </Card>
  );
}

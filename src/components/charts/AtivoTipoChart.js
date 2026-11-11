import { useMemo } from "react";
import { Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { Card } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";
import { buildTipoChartData } from "../../utils/investimento";

export default function AtivoTipoChart({ ativos = [] }) {
  const { colors } = useTheme();
  const chartData = useMemo(() => buildTipoChartData(ativos), [ativos]);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const pieData = chartData.map((item) => ({
    value: item.value,
    color: item.color,
    text: total > 0 ? `${Math.round((item.value / total) * 100)}%` : "",
  }));

  return (
    <Card style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
        Distribuição por tipo
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2, marginBottom: 10 }}>
        Valor de mercado por classe de ativo
      </Text>

      {chartData.length === 0 ? (
        <View style={{ height: 160, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted, fontSize: 13 }}>
            Cadastre investimentos para ver o gráfico
          </Text>
        </View>
      ) : (
        <>
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
        </>
      )}
    </Card>
  );
}

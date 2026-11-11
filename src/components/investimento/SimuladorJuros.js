import { useEffect, useMemo, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Card, Field } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";
import {
  calcularJurosCompostos,
  formatInputCurrency,
  parseCurrencyToNumber,
} from "../../utils/investimento";

export default function SimuladorJuros({ patrimonioAtual = 0 }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [aporteMensal, setAporteMensal] = useState("500,00");
  const [taxaAnual, setTaxaAnual] = useState("12");
  const [tempoMeses, setTempoMeses] = useState("120");
  const [valorInicial, setValorInicial] = useState("0,00");

  useEffect(() => {
    if (patrimonioAtual > 0) {
      setValorInicial(
        patrimonioAtual.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
    }
  }, [patrimonioAtual]);

  const aporte = parseCurrencyToNumber(aporteMensal);
  const taxaAnualNum = parseCurrencyToNumber(taxaAnual);
  const meses = Math.min(600, Math.max(1, Math.floor(parseCurrencyToNumber(tempoMeses) || 1)));
  const inicial = parseCurrencyToNumber(valorInicial);
  const taxaMensal = useMemo(
    () => (Math.pow(1 + taxaAnualNum / 100, 1 / 12) - 1) * 100,
    [taxaAnualNum],
  );

  const projecao = useMemo(
    () => calcularJurosCompostos(aporte, taxaMensal, meses, inicial),
    [aporte, taxaMensal, meses, inicial],
  );

  const valorFinal = projecao[projecao.length - 1]?.valor || 0;
  const totalAportado = inicial + aporte * meses;
  const juros = valorFinal - totalAportado;

  const step = Math.max(1, Math.floor(meses / 8));
  const chartData = projecao
    .filter((_, index) => index === 0 || index === meses || index % step === 0)
    .map((item) => ({
      value: item.valor,
      label: item.label,
    }));

  return (
    <Card style={{ marginBottom: 14 }}>
      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
        Simulador de juros compostos
      </Text>
      <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2, marginBottom: 12 }}>
        Projete o crescimento do patrimônio
      </Text>

      <Field
        placeholder="Valor inicial"
        value={valorInicial}
        onChangeText={(value) => setValorInicial(formatInputCurrency(value))}
        keyboardType="number-pad"
      />
      <Field
        placeholder="Aporte mensal"
        value={aporteMensal}
        onChangeText={(value) => setAporteMensal(formatInputCurrency(value))}
        keyboardType="number-pad"
      />
      <Field
        placeholder="Taxa anual (%)"
        value={taxaAnual}
        onChangeText={setTaxaAnual}
        keyboardType="decimal-pad"
      />
      <Field
        placeholder="Tempo (meses)"
        value={tempoMeses}
        onChangeText={setTempoMeses}
        keyboardType="number-pad"
      />

      <View style={{ gap: 6, marginBottom: 12 }}>
        <Text style={{ color: colors.ink, fontWeight: "700" }}>
          Valor final: {formatBRL(valorFinal)}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 13 }}>
          Total aportado: {formatBRL(totalAportado)}
        </Text>
        <Text style={{ color: colors.success, fontSize: 13, fontWeight: "600" }}>
          Juros: {formatBRL(juros)}
        </Text>
      </View>

      <LineChart
        data={chartData}
        width={Math.max(width - 80, 280)}
        height={160}
        color={colors.success}
        thickness={3}
        hideDataPoints
        areaChart
        startFillColor={colors.success}
        endFillColor={colors.success}
        startOpacity={0.2}
        endOpacity={0.02}
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
    </Card>
  );
}

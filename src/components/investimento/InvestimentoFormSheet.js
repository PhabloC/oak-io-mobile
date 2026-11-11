import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, Switch, Text, View } from "react-native";
import { Field, Pill, PrimaryButton } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { formatBRL } from "../../utils/format";
import { formatInputCurrency, parseCurrencyToNumber } from "../../utils/investimento";
import SheetShell from "./SheetShell";

export default function InvestimentoFormSheet({
  visible,
  ativos = [],
  ativoPreSelecionado = null,
  onClose,
  onSave,
}) {
  const { colors } = useTheme();
  const [ativoId, setAtivoId] = useState(null);
  const [quantidadeTotal, setQuantidadeTotal] = useState("");
  const [valorInvestidoTotal, setValorInvestidoTotal] = useState("");
  const [emergencia, setEmergencia] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const selected = ativoPreSelecionado || ativos[0] || null;
    setAtivoId(selected?.id || null);
    setEmergencia(selected?.emergencia === true);
    setQuantidadeTotal(
      selected?.quantidade != null && Number(selected.quantidade) > 0
        ? String(selected.quantidade)
        : "",
    );
    setValorInvestidoTotal(
      Number(selected?.valor_investido) > 0
        ? Number(selected.valor_investido).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "",
    );
    setSaving(false);
  }, [visible, ativoPreSelecionado, ativos]);

  const ativoSelecionado = useMemo(
    () => ativos.find((item) => item.id === ativoId) || null,
    [ativos, ativoId],
  );

  const qtdNum = parseFloat(String(quantidadeTotal).replace(",", ".")) || 0;
  const investidoNum = parseCurrencyToNumber(valorInvestidoTotal);
  const preco = Number(ativoSelecionado?.preco_atual) || 0;
  const valorMercadoEstimado = preco > 0 && qtdNum > 0 ? qtdNum * preco : null;
  const lucroEstimado =
    valorMercadoEstimado != null ? valorMercadoEstimado - investidoNum : null;

  const handleSave = async () => {
    if (!ativoSelecionado) {
      Alert.alert("Atenção", "Selecione um ativo.");
      return;
    }
    if (qtdNum <= 0) {
      Alert.alert("Atenção", "Informe a quantidade total na corretora.");
      return;
    }
    if (investidoNum < 0) {
      Alert.alert("Atenção", "Informe o valor total investido.");
      return;
    }

    setSaving(true);
    const result = await onSave(ativoSelecionado, {
      quantidadeTotal: qtdNum,
      valorInvestidoTotal: investidoNum,
      emergencia,
    });
    setSaving(false);
    if (result?.error) {
      Alert.alert("Erro", "Não foi possível salvar o investimento.");
      return;
    }
    onClose();
  };

  if (ativos.length === 0) {
    return (
      <SheetShell visible={visible} title="Atualizar posição" onClose={onClose}>
        <Text style={{ color: colors.muted, marginBottom: 16 }}>
          Cadastre um ativo antes de registrar a posição.
        </Text>
        <PrimaryButton label="Fechar" onPress={onClose} />
      </SheetShell>
    );
  }

  return (
    <SheetShell visible={visible} title="Atualizar posição" onClose={onClose}>
      <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 8 }}>
        Espelhe o que está na corretora
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {ativos.map((ativo) => (
          <Pill
            key={ativo.id}
            label={ativo.ticker || ativo.nome}
            selected={ativoId === ativo.id}
            onPress={() => {
              setAtivoId(ativo.id);
              setEmergencia(ativo.emergencia === true);
              setQuantidadeTotal(
                ativo.quantidade != null && Number(ativo.quantidade) > 0
                  ? String(ativo.quantidade)
                  : "",
              );
              setValorInvestidoTotal(
                Number(ativo.valor_investido) > 0
                  ? Number(ativo.valor_investido).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : "",
              );
            }}
          />
        ))}
      </View>

      {ativoSelecionado ? (
        <View
          style={{
            backgroundColor: colors.canvas,
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.ink, fontWeight: "700" }}>
            {ativoSelecionado.ticker || ativoSelecionado.nome}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
            {ativoSelecionado.nome}
          </Text>
          {preco > 0 ? (
            <Text style={{ color: colors.accent, fontSize: 12, marginTop: 6, fontWeight: "600" }}>
              Cotação atual: {formatBRL(preco)}
            </Text>
          ) : (
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>
              Cotação será buscada ao salvar
            </Text>
          )}
        </View>
      ) : null}

      <Field
        label="Quantidade total na corretora"
        placeholder="Ex.: 100"
        value={quantidadeTotal}
        onChangeText={setQuantidadeTotal}
        keyboardType="decimal-pad"
      />
      <Field
        label="Total investido (R$)"
        placeholder="0,00"
        value={valorInvestidoTotal}
        onChangeText={(value) => setValorInvestidoTotal(formatInputCurrency(value))}
        keyboardType="number-pad"
      />

      <Pressable
        onPress={() => setEmergencia((current) => !current)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 14,
          borderRadius: 16,
          backgroundColor: emergencia ? colors.tintWarning : colors.canvas,
          marginBottom: 14,
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: colors.ink, fontWeight: "600" }}>Reserva de emergência</Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
            Contabilizar este ativo na reserva
          </Text>
        </View>
        <Switch value={emergencia} onValueChange={setEmergencia} />
      </Pressable>

      {valorMercadoEstimado != null && investidoNum >= 0 ? (
        <View
          style={{
            borderRadius: 14,
            padding: 12,
            marginBottom: 14,
            backgroundColor:
              lucroEstimado >= 0 ? colors.tintSuccess : colors.tintDanger,
          }}
        >
          <Text style={{ color: colors.muted, fontSize: 12 }}>Valor de mercado estimado</Text>
          <Text style={{ color: colors.ink, fontWeight: "700", marginTop: 4 }}>
            {formatBRL(valorMercadoEstimado)}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontWeight: "700",
              color: lucroEstimado >= 0 ? colors.success : colors.danger,
            }}
          >
            {lucroEstimado >= 0 ? "+" : ""}
            {formatBRL(lucroEstimado)} vs. investido
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label={saving ? "Salvando..." : "Salvar posição"}
        onPress={handleSave}
        disabled={saving}
      />
    </SheetShell>
  );
}

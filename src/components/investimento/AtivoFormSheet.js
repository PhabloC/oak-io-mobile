import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { Field, Pill, PrimaryButton } from "../../design-system";
import { useTheme } from "../../context/ThemeContext";
import { searchMarketTickers } from "../../services/market";
import {
  TIPOS_ATIVO,
  dateForInput,
  formatInputCurrency,
  parseCurrencyToNumber,
} from "../../utils/investimento";
import SheetShell from "./SheetShell";

const MERCADOS = [
  { value: "b3", label: "B3", placeholder: "Ex.: PETR4, MXRF..." },
  { value: "crypto", label: "Cripto", placeholder: "Ex.: BTC, Ethereum..." },
  { value: "exterior", label: "Exterior", placeholder: "Ex.: AAPL, VOO..." },
  { value: "tesouro", label: "Tesouro", placeholder: "Ex.: Selic, Tesouro..." },
];

const FILTROS_B3 = [
  { value: "all", label: "Todos", apiType: null },
  { value: "acoes", label: "Ações", apiType: "stock" },
  { value: "fiis", label: "FIIs", apiType: "fund" },
];

function formatHint(preco, mercado) {
  if (preco == null || !Number.isFinite(Number(preco))) return null;
  if (mercado === "exterior") return `US$ ${Number(preco).toFixed(2)}`;
  return `R$ ${Number(preco).toFixed(2)}`;
}

export default function AtivoFormSheet({ visible, onClose, onSave }) {
  const { colors } = useTheme();
  const [market, setMarket] = useState("b3");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filtroTipo, setFiltroTipo] = useState("all");
  const [quantidade, setQuantidade] = useState("");
  const [valorInvestido, setValorInvestido] = useState("");
  const [saving, setSaving] = useState(false);
  const searchSeq = useRef(0);

  useEffect(() => {
    if (!visible) return;
    setMarket("b3");
    setQuery("");
    setResults([]);
    setSelected(null);
    setFiltroTipo("all");
    setQuantidade("");
    setValorInvestido("");
    setSaving(false);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const term = query.trim();
    const minLen = market === "tesouro" ? 1 : 2;
    if (term.length < minLen) {
      if (market === "tesouro" && term.length === 0) {
        // mostra catalogo inicial
        searchMarketTickers({ search: "selic", market: "tesouro", limit: 10 })
          .then(setResults)
          .catch(() => setResults([]));
      } else {
        setResults([]);
      }
      setSearching(false);
      return;
    }

    const seq = ++searchSeq.current;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const apiType =
          market === "b3"
            ? FILTROS_B3.find((item) => item.value === filtroTipo)?.apiType
            : null;
        const list = await searchMarketTickers({
          search: term,
          type: apiType,
          market,
          limit: 20,
        });
        if (seq === searchSeq.current) setResults(list);
      } catch {
        if (seq === searchSeq.current) {
          setResults([]);
          Alert.alert("Erro", "Não foi possível buscar ativos agora.");
        }
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, filtroTipo, market, visible]);

  const handleSave = async () => {
    if (!selected?.ticker && !selected?.tickerKey) {
      Alert.alert("Atenção", "Busque e selecione um ativo da lista.");
      return;
    }

    const qtd = parseFloat(String(quantidade).replace(",", "."));
    const investido = parseCurrencyToNumber(valorInvestido);
    if (!Number.isFinite(qtd) || qtd <= 0) {
      Alert.alert("Atenção", "Informe a quantidade na corretora.");
      return;
    }
    if (investido < 0) {
      Alert.alert("Atenção", "Informe o valor investido.");
      return;
    }

    const preco = selected.precoHint != null ? Number(selected.precoHint) : 0;
    const tickerKey = selected.tickerKey || selected.ticker;
    const isTesouro = selected.tipo === "tesouro_selic";

    setSaving(true);
    const result = await onSave({
      nome: selected.nome,
      ticker: selected.ticker,
      ticker_normalizado: tickerKey,
      tipo: selected.tipo,
      quantidade: qtd,
      valor_investido: investido,
      valor_atual:
        isTesouro && !preco
          ? investido
          : preco > 0
            ? qtd * preco
            : 0,
      preco_atual: preco > 0 ? preco : null,
      preco_atualizado_em: preco > 0 ? new Date().toISOString() : null,
      cotacao_status: preco > 0 ? "ok" : isTesouro ? "ok" : null,
      logo_url: selected.logoUrl,
      moeda: "BRL",
      data_compra: dateForInput(),
      taxa_selic_anual: isTesouro ? null : null,
    });
    setSaving(false);

    if (result?.error) {
      Alert.alert(
        "Erro",
        result.error.message?.includes("tipo")
          ? "Rode a migration 009 no Supabase e tente de novo."
          : "Não foi possível cadastrar o ativo.",
      );
      return;
    }
    onClose();
  };

  const mercadoAtual = MERCADOS.find((item) => item.value === market);

  return (
    <SheetShell visible={visible} title="Cadastrar ativo" onClose={onClose}>
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
        Mercado
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {MERCADOS.map((item) => (
          <Pill
            key={item.value}
            label={item.label}
            selected={market === item.value}
            onPress={() => {
              setMarket(item.value);
              setQuery("");
              setSelected(null);
              setResults([]);
              setFiltroTipo("all");
            }}
          />
        ))}
      </View>

      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
        Digite e selecione o ativo real
      </Text>

      {market === "b3" ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {FILTROS_B3.map((item) => (
            <Pill
              key={item.value}
              label={item.label}
              selected={filtroTipo === item.value}
              onPress={() => setFiltroTipo(item.value)}
            />
          ))}
        </View>
      ) : null}

      <Field
        placeholder={mercadoAtual?.placeholder || "Buscar..."}
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setSelected(null);
        }}
        autoCapitalize={market === "crypto" || market === "exterior" ? "characters" : "none"}
      />

      {searching ? (
        <ActivityIndicator color={colors.accent} style={{ marginBottom: 12 }} />
      ) : null}

      {results.length > 0 && !selected ? (
        <View style={{ marginBottom: 12, gap: 6 }}>
          {results.map((item) => (
            <Pressable
              key={`${item.tickerKey || item.ticker}-${item.tipo}`}
              onPress={() => {
                setSelected(item);
                setQuery(item.ticker);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                padding: 12,
                borderRadius: 14,
                backgroundColor: colors.canvas,
              }}
            >
              {item.logoUrl ? (
                <Image
                  source={{ uri: item.logoUrl }}
                  style={{ width: 32, height: 32, borderRadius: 8 }}
                />
              ) : (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: colors.accentSoft,
                  }}
                />
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.ink, fontWeight: "700" }}>{item.ticker}</Text>
                <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>
                  {item.nome}
                </Text>
              </View>
              {item.precoHint != null ? (
                <Text style={{ color: colors.accent, fontWeight: "600", fontSize: 12 }}>
                  {formatHint(item.precoHint, item.mercado || market)}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {selected ? (
        <View
          style={{
            backgroundColor: colors.tintSuccess,
            borderRadius: 14,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.success, fontWeight: "700" }}>
            {selected.ticker} · {selected.nome}
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
            Tipo: {TIPOS_ATIVO.find((t) => t.value === selected.tipo)?.label || selected.tipo}
            {selected.mercado === "exterior" ? " · cotação convertida p/ BRL" : ""}
            {selected.tipo === "tesouro_selic" && selected.ticker === "SELIC"
              ? " · projeção Selic BCB"
              : ""}
          </Text>
        </View>
      ) : null}

      <Field
        label={
          selected?.tipo === "tesouro_selic" && selected?.ticker === "SELIC"
            ? "Quantidade (opcional, use 1)"
            : "Quantidade na corretora"
        }
        placeholder="Ex.: 100"
        value={quantidade}
        onChangeText={setQuantidade}
        keyboardType="decimal-pad"
      />
      <Field
        label="Total investido (R$)"
        placeholder="0,00"
        value={valorInvestido}
        onChangeText={(value) => setValorInvestido(formatInputCurrency(value))}
        keyboardType="number-pad"
      />

      <PrimaryButton
        label={saving ? "Salvando..." : "Salvar ativo"}
        onPress={handleSave}
        disabled={saving}
      />
    </SheetShell>
  );
}

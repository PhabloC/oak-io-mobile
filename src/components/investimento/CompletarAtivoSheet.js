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
import { TIPOS_ATIVO } from "../../utils/investimento";
import SheetShell from "./SheetShell";

const MERCADOS = [
  { value: "b3", label: "B3" },
  { value: "crypto", label: "Cripto" },
  { value: "exterior", label: "Exterior" },
];

function marketFromTipo(tipo) {
  if (tipo === "cripto" || tipo === "exterior_cripto") return "crypto";
  if (tipo === "acoes_exterior" || tipo === "etf_exterior") return "exterior";
  return "b3";
}

export default function CompletarAtivoSheet({ visible, ativo, onClose, onSave }) {
  const { colors } = useTheme();
  const [market, setMarket] = useState("b3");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const searchSeq = useRef(0);

  useEffect(() => {
    if (!visible || !ativo) return;
    setMarket(marketFromTipo(ativo.tipo));
    setQuery(ativo.ticker || ativo.nome || "");
    setResults([]);
    setSelected(null);
    setSaving(false);
  }, [visible, ativo]);

  useEffect(() => {
    if (!visible) return;
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const seq = ++searchSeq.current;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const list = await searchMarketTickers({
          search: term,
          market,
          limit: 20,
        });
        if (seq === searchSeq.current) setResults(list);
      } catch {
        if (seq === searchSeq.current) setResults([]);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, market, visible]);

  const handleSave = async () => {
    if (!selected?.ticker && !selected?.tickerKey) {
      Alert.alert("Atenção", "Selecione um ativo da lista da API.");
      return;
    }

    setSaving(true);
    const result = await onSave({
      nome: selected.nome,
      ticker: selected.ticker,
      ticker_normalizado: selected.tickerKey || selected.ticker,
      tipo: selected.tipo,
      logo_url: selected.logoUrl || null,
      moeda: "BRL",
      cotacao_status: selected.precoHint != null ? "ok" : null,
      preco_atual: selected.precoHint != null ? Number(selected.precoHint) : null,
    });
    setSaving(false);

    if (result?.error) {
      Alert.alert("Erro", "Não foi possível atualizar o ativo.");
      return;
    }
    onClose();
  };

  if (!ativo) return null;

  return (
    <SheetShell visible={visible} title="Completar ticker" onClose={onClose}>
      <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 10 }}>
        Ativo antigo: {ativo.nome}
        {ativo.ticker ? ` (${ativo.ticker})` : ""}. Busque e selecione o ticker
        real na API.
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {MERCADOS.map((item) => (
          <Pill
            key={item.value}
            label={item.label}
            selected={market === item.value}
            onPress={() => {
              setMarket(item.value);
              setSelected(null);
              setResults([]);
            }}
          />
        ))}
      </View>

      <Field
        placeholder="Buscar ticker ou nome"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setSelected(null);
        }}
        autoCapitalize="characters"
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
          </Text>
        </View>
      ) : null}

      <PrimaryButton
        label={saving ? "Salvando..." : "Vincular ticker"}
        onPress={handleSave}
        disabled={saving}
      />
    </SheetShell>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Pencil, PiggyBank, RefreshCw, Settings, Shield, Trash2 } from "lucide-react-native";
import Screen from "../components/Screen";
import AppHeader from "../components/AppHeader";
import AtivoTipoChart from "../components/charts/AtivoTipoChart";
import PatrimonioEvolutionChart from "../components/charts/PatrimonioEvolutionChart";
import CarteiraDailyChart from "../components/charts/CarteiraDailyChart";
import AtivoFormSheet from "../components/investimento/AtivoFormSheet";
import CompletarAtivoSheet from "../components/investimento/CompletarAtivoSheet";
import ConfirmSheet from "../components/investimento/ConfirmSheet";
import EditarAtivoSheet from "../components/investimento/EditarAtivoSheet";
import EditarValorSheet from "../components/investimento/EditarValorSheet";
import InvestimentoFormSheet from "../components/investimento/InvestimentoFormSheet";
import SimuladorJuros from "../components/investimento/SimuladorJuros";
import { listAtivosPendentes } from "../utils/ativosPendentes";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "../components/icons/UiIconSvg";
import { useFinance } from "../context/FinanceContext";
import { useTheme } from "../context/ThemeContext";
import { Card, Field, Pill, SectionTitle, radius } from "../design-system";
import { formatBRL } from "../utils/format";
import { calcValorizacaoMes, fetchCarteiraHistorico } from "../services/market";
import {
  ALOCACAO_IDEAL,
  STORAGE_GASTO_LOCK,
  STORAGE_GASTO_MENSAL,
  STORAGE_MESES_RESERVA,
  TIPOS_LABEL,
  filterPatrimonioHistorico,
  formatInputCurrency,
  parseCurrencyToNumber,
  sortPatrimonioDesc,
  valorMercadoEfetivo,
} from "../utils/investimento";

const ITENS_POR_PAGINA = 6;

function IconButton({ onPress, children, backgroundColor }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        width: 34,
        height: 34,
        borderRadius: 12,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </Pressable>
  );
}

function Row({ label, value, valueColor, colors }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: colors.muted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: valueColor || colors.ink, fontSize: 13, fontWeight: "600" }}>
        {value}
      </Text>
    </View>
  );
}

function Pagination({ page, totalPages, totalItems, label, onPrev, onNext, colors }) {
  if (totalPages <= 1) return null;
  return (
    <View
      style={{
        marginTop: 10,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 12 }}>
        Página {page} de {totalPages} ({totalItems} {label})
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <IconButton onPress={onPrev} backgroundColor={colors.accentSoft}>
          <ChevronLeftIcon color={colors.accent} size={16} strokeWidth={2.2} />
        </IconButton>
        <IconButton onPress={onNext} backgroundColor={colors.accentSoft}>
          <ChevronRightIcon color={colors.accent} size={16} strokeWidth={2.2} />
        </IconButton>
      </View>
    </View>
  );
}

export default function InvestimentoScreen() {
  const { colors } = useTheme();
  const {
    ativos,
    ativosLoading,
    patrimonioHistorico,
    gastosMediosMensais,
    createAtivo,
    updateAtivo,
    registerInvestimento,
    clearInvestimentosAtivo,
    deleteAtivo,
    upsertPatrimonioSnapshot,
    refreshAtivosQuotes,
    valorizacaoMes,
    proventosMes,
    dividendosMesTotal,
    dividendosLoading,
    dividendosPorAtivo,
  } = useFinance();

  const [quotesLoading, setQuotesLoading] = useState(false);
  const [lastQuoteAt, setLastQuoteAt] = useState(null);
  const [historicoDiario, setHistoricoDiario] = useState([]);
  const [showCompletarAtivo, setShowCompletarAtivo] = useState(false);
  const [ativoParaCompletar, setAtivoParaCompletar] = useState(null);
  const [showModalAtivo, setShowModalAtivo] = useState(false);
  const [showModalInvestimento, setShowModalInvestimento] = useState(false);
  const [ativoPreSelecionado, setAtivoPreSelecionado] = useState(null);
  const [showEditarAtivo, setShowEditarAtivo] = useState(false);
  const [ativoParaEditar, setAtivoParaEditar] = useState(null);
  const [showEditarValor, setShowEditarValor] = useState(false);
  const [ativoParaEditarValor, setAtivoParaEditarValor] = useState(null);
  const [showExcluir, setShowExcluir] = useState(false);
  const [ativoParaExcluir, setAtivoParaExcluir] = useState(null);
  const [showRemoverInvestimentos, setShowRemoverInvestimentos] = useState(false);
  const [ativoParaRemover, setAtivoParaRemover] = useState(null);
  const [showSnapshot, setShowSnapshot] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [pageAtivos, setPageAtivos] = useState(1);
  const [pageInvestimentos, setPageInvestimentos] = useState(1);
  const [showFiltro, setShowFiltro] = useState(false);
  const [periodoInicio, setPeriodoInicio] = useState("");
  const [periodoFim, setPeriodoFim] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [gastoMensalManual, setGastoMensalManual] = useState("");
  const [gastoEdit, setGastoEdit] = useState("");
  const [gastoLocked, setGastoLocked] = useState(false);
  const [mesesReserva, setMesesReserva] = useState("6");

  useEffect(() => {
    const loadReserva = async () => {
      try {
        const [gasto, lock, meses] = await Promise.all([
          AsyncStorage.getItem(STORAGE_GASTO_MENSAL),
          AsyncStorage.getItem(STORAGE_GASTO_LOCK),
          AsyncStorage.getItem(STORAGE_MESES_RESERVA),
        ]);
        const savedGasto = gasto || "";
        setGastoMensalManual(savedGasto);
        setGastoEdit(savedGasto);
        setGastoLocked(lock === "true");
        setMesesReserva(meses === "12" ? "12" : "6");
      } catch {
        // ignore storage errors
      }
    };
    loadReserva();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_MESES_RESERVA, mesesReserva).catch(() => {});
  }, [mesesReserva]);

  const flash = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const patrimonioTotal = useMemo(
    () => ativos.reduce((sum, ativo) => sum + valorMercadoEfetivo(ativo), 0),
    [ativos],
  );
  const patrimonioEmergencia = useMemo(
    () =>
      ativos
        .filter((ativo) => ativo.emergencia === true)
        .reduce((sum, ativo) => sum + valorMercadoEfetivo(ativo), 0),
    [ativos],
  );
  const valorInvestidoTotal = useMemo(
    () => ativos.reduce((sum, ativo) => sum + Number(ativo.valor_investido || 0), 0),
    [ativos],
  );
  const lucroPrejuizo = patrimonioTotal - valorInvestidoTotal;
  const percentualVariacao =
    valorInvestidoTotal > 0
      ? ((patrimonioTotal - valorInvestidoTotal) / valorInvestidoTotal) * 100
      : 0;
  const valorizacaoMesLive = useMemo(
    () =>
      calcValorizacaoMes(
        patrimonioTotal,
        valorizacaoMes?.patrimonioBase || 0,
        valorInvestidoTotal,
        valorizacaoMes?.investidoBase ?? 0,
      ),
    [
      patrimonioTotal,
      valorizacaoMes?.patrimonioBase,
      valorizacaoMes?.investidoBase,
      valorInvestidoTotal,
    ],
  );
  const ativosPendentes = useMemo(() => listAtivosPendentes(ativos), [ativos]);
  const dividendosPorAtivoMap = useMemo(
    () => Object.fromEntries((dividendosPorAtivo || []).map((item) => [item.ativoId, item])),
    [dividendosPorAtivo],
  );

  const ativosComInvestimento = useMemo(
    () => ativos.filter((ativo) => Number(ativo.valor_investido || 0) > 0),
    [ativos],
  );

  const totalPaginasAtivos = Math.ceil(ativos.length / ITENS_POR_PAGINA) || 1;
  const totalPaginasInvestimentos =
    Math.ceil(ativosComInvestimento.length / ITENS_POR_PAGINA) || 1;

  const ativosPaginados = useMemo(() => {
    const start = (pageAtivos - 1) * ITENS_POR_PAGINA;
    return ativos.slice(start, start + ITENS_POR_PAGINA);
  }, [ativos, pageAtivos]);

  const investimentosPaginados = useMemo(() => {
    const start = (pageInvestimentos - 1) * ITENS_POR_PAGINA;
    return ativosComInvestimento.slice(start, start + ITENS_POR_PAGINA);
  }, [ativosComInvestimento, pageInvestimentos]);

  useEffect(() => {
    if (pageAtivos > totalPaginasAtivos) setPageAtivos(totalPaginasAtivos);
  }, [pageAtivos, totalPaginasAtivos]);

  useEffect(() => {
    if (pageInvestimentos > totalPaginasInvestimentos) {
      setPageInvestimentos(totalPaginasInvestimentos);
    }
  }, [pageInvestimentos, totalPaginasInvestimentos]);

  const alocacaoAtual = useMemo(() => {
    if (patrimonioTotal <= 0) return {};
    return ativos.reduce((acc, ativo) => {
      const value = valorMercadoEfetivo(ativo);
      acc[ativo.tipo] = (acc[ativo.tipo] || 0) + value;
      return acc;
    }, {});
  }, [ativos, patrimonioTotal]);

  const alocacaoPercentuais = useMemo(() => {
    if (patrimonioTotal <= 0) return {};
    return Object.fromEntries(
      Object.entries(alocacaoAtual).map(([tipo, valor]) => [
        tipo,
        (valor / patrimonioTotal) * 100,
      ]),
    );
  }, [alocacaoAtual, patrimonioTotal]);

  const patrimonioFiltrado = useMemo(
    () => filterPatrimonioHistorico(patrimonioHistorico, periodoInicio, periodoFim),
    [patrimonioHistorico, periodoInicio, periodoFim],
  );

  const gastoEfetivo =
    parseCurrencyToNumber(gastoMensalManual) > 0
      ? parseCurrencyToNumber(gastoMensalManual)
      : gastosMediosMensais;
  const metaReserva = gastoEfetivo * (parseInt(mesesReserva, 10) || 6);
  const pctReserva = metaReserva > 0 ? (patrimonioEmergencia / metaReserva) * 100 : 0;
  const gastoEditDirty = gastoEdit !== gastoMensalManual;

  const handleSalvarGasto = async () => {
    setGastoMensalManual(gastoEdit);
    setGastoLocked(true);
    try {
      await AsyncStorage.setItem(STORAGE_GASTO_MENSAL, gastoEdit);
      await AsyncStorage.setItem(STORAGE_GASTO_LOCK, "true");
    } catch {
      // ignore
    }
  };

  const handleEditarGasto = async () => {
    setGastoEdit(gastoMensalManual);
    setGastoLocked(false);
    try {
      await AsyncStorage.setItem(STORAGE_GASTO_LOCK, "false");
    } catch {
      // ignore
    }
  };

  const openInvestimento = (ativo = null) => {
    setAtivoPreSelecionado(ativo);
    setShowModalInvestimento(true);
  };

  const syncQuotes = useCallback(
    async ({ force = false, silent = false } = {}) => {
      setQuotesLoading(true);
      try {
        const result = await refreshAtivosQuotes({ force });
        setLastQuoteAt(new Date());
        try {
          const hist = await fetchCarteiraHistorico(120);
          setHistoricoDiario(hist);
        } catch {
          // ignore
        }
        if (!silent && result?.updated > 0) {
          flash(`${result.updated} cotação(ões) atualizada(s)`);
        }
      } catch {
        if (!silent) Alert.alert("Erro", "Não foi possível atualizar as cotações.");
      } finally {
        setQuotesLoading(false);
      }
    },
    [refreshAtivosQuotes],
  );

  useFocusEffect(
    useCallback(() => {
      syncQuotes({ silent: true });
    }, [syncQuotes]),
  );

  const handleSnapshot = async () => {
    setConfirmLoading(true);
    const result = await upsertPatrimonioSnapshot(patrimonioTotal);
    setConfirmLoading(false);
    setShowSnapshot(false);
    if (result?.error) {
      Alert.alert("Erro", "Não foi possível registrar o snapshot.");
      return;
    }
    flash("Snapshot registrado!");
  };

  if (ativosLoading) {
    return (
      <Screen scroll={false}>
        <AppHeader title="Investimentos" showBack showAvatar={false} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={{ color: colors.muted, marginTop: 12 }}>Carregando investimentos...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader title="Investimentos" showBack showAvatar={false} />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <Pill
          label="Cadastrar ativo"
          selected
          onPress={() => setShowModalAtivo(true)}
          icon={<PlusIcon color={colors.onAccent} size={14} strokeWidth={2.2} />}
        />
        <Pill
          label="Atualizar posição"
          selected={false}
          onPress={() => openInvestimento(null)}
          icon={<PiggyBank color={colors.accent} size={14} strokeWidth={2.2} />}
        />
        <Pill
          label={quotesLoading ? "Atualizando..." : "Cotações"}
          selected={false}
          onPress={() => syncQuotes({ force: true })}
          icon={<RefreshCw color={colors.accent} size={14} strokeWidth={2.2} />}
        />
      </View>
      {lastQuoteAt ? (
        <Text style={{ color: colors.muted, fontSize: 11, marginBottom: 10 }}>
          Cotações atualizadas às{" "}
          {lastQuoteAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </Text>
      ) : null}

      {successMessage ? (
        <View
          style={{
            backgroundColor: colors.tintSuccess,
            borderRadius: radius.md,
            padding: 12,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: colors.success, fontWeight: "600" }}>{successMessage}</Text>
        </View>
      ) : null}

      {ativosPendentes.length > 0 ? (
        <Card
          style={{
            marginBottom: 12,
            backgroundColor: colors.tintWarning,
            borderWidth: 1,
            borderColor: colors.warning,
          }}
        >
          <Text style={{ color: colors.warning, fontWeight: "700", fontSize: 14 }}>
            Complete {ativosPendentes.length} ativo(s) antigo(s)
          </Text>
          <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 10 }}>
            Reescolha o ticker na busca da API para liberar cotação automática.
          </Text>
          {ativosPendentes.slice(0, 5).map((ativo) => (
            <Pressable
              key={ativo.id}
              onPress={() => {
                setAtivoParaCompletar(ativo);
                setShowCompletarAtivo(true);
              }}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 8,
                borderTopWidth: 1,
                borderTopColor: colors.line,
              }}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={{ color: colors.ink, fontWeight: "600" }}>{ativo.nome}</Text>
                <Text style={{ color: colors.muted, fontSize: 11 }}>
                  {ativo.ticker || "Sem ticker"} · {TIPOS_LABEL[ativo.tipo] || ativo.tipo}
                </Text>
              </View>
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>
                Completar
              </Text>
            </Pressable>
          ))}
        </Card>
      ) : null}

      <Card style={{ marginBottom: 12, backgroundColor: colors.accent }}>
        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Patrimônio investido</Text>
        <Text style={{ marginTop: 6, color: colors.onAccent, fontSize: 28, fontWeight: "700" }}>
          {formatBRL(patrimonioTotal)}
        </Text>
        <Text style={{ marginTop: 6, color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
          Valor atual dos investimentos
        </Text>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Valorização no mês</Text>
        <Text
          style={{
            marginTop: 6,
            color: valorizacaoMesLive.valor >= 0 ? colors.success : colors.danger,
            fontSize: 22,
            fontWeight: "700",
          }}
        >
          {formatBRL(valorizacaoMesLive.valor)}
        </Text>
        <Text
          style={{
            marginTop: 4,
            color: valorizacaoMesLive.valor >= 0 ? colors.success : colors.danger,
            fontSize: 13,
            fontWeight: "600",
          }}
        >
          {valorizacaoMesLive.percentual >= 0 ? "+" : ""}
          {valorizacaoMesLive.percentual.toFixed(2)}%
        </Text>
        <Text style={{ marginTop: 6, color: colors.muted, fontSize: 11 }}>
          vs. início do mês, descontando aportes
          {valorizacaoMesLive.aportesLiquidos
            ? ` · aportes ${formatBRL(valorizacaoMesLive.aportesLiquidos)}`
            : ""}
          {valorizacaoMesLive.patrimonioBase > 0
            ? ` · base ${formatBRL(valorizacaoMesLive.patrimonioBase)}`
            : ""}
        </Text>
      </Card>

      <Card style={{ marginBottom: 12 }}>
        <Text style={{ color: colors.muted, fontSize: 12 }}>Dividendos no mês</Text>
        <Text
          style={{
            marginTop: 6,
            color: colors.success,
            fontSize: 22,
            fontWeight: "700",
          }}
        >
          {dividendosLoading && !dividendosMesTotal
            ? "..."
            : formatBRL(dividendosMesTotal || 0)}
        </Text>
        <Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>
          {(proventosMes || []).length} provento(s) por data de pagamento
        </Text>
      </Card>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Lucro / Prejuízo</Text>
          <Text
            style={{
              marginTop: 6,
              color: lucroPrejuizo >= 0 ? colors.success : colors.danger,
              fontSize: 18,
              fontWeight: "700",
            }}
          >
            {formatBRL(lucroPrejuizo)}
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: lucroPrejuizo >= 0 ? colors.success : colors.danger,
              fontSize: 12,
            }}
          >
            {percentualVariacao >= 0 ? "+" : ""}
            {percentualVariacao.toFixed(2)}%
          </Text>
        </Card>
        <Card style={{ flex: 1, marginBottom: 0 }}>
          <Text style={{ color: colors.muted, fontSize: 12 }}>Total investido</Text>
          <Text style={{ marginTop: 6, color: colors.ink, fontSize: 18, fontWeight: "700" }}>
            {formatBRL(valorInvestidoTotal)}
          </Text>
          <Text style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>
            Soma dos aportes
          </Text>
        </Card>
      </View>

      {(proventosMes || []).length > 0 ? (
        <>
          <SectionTitle style={{ marginBottom: 10 }}>Proventos do mês</SectionTitle>
          <Card style={{ marginBottom: 14 }}>
            {(proventosMes || []).slice(0, 12).map((item, index, arr) => (
              <View
                key={item.id}
                style={{
                  paddingVertical: 10,
                  borderBottomWidth: index === arr.length - 1 ? 0 : 1,
                  borderBottomColor: colors.line,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.ink, fontWeight: "700" }}>
                    {item.ticker}
                  </Text>
                  <Text style={{ color: colors.success, fontWeight: "700" }}>
                    {formatBRL(item.valor_total)}
                  </Text>
                </View>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  {item.tipo}
                  {item.payment_date
                    ? ` · ${String(item.payment_date).slice(8, 10)}/${String(item.payment_date).slice(5, 7)}`
                    : ""}
                  {` · ${Number(item.quantidade_base || 0)} × ${formatBRL(item.rate)}`}
                </Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionTitle style={{ marginBottom: 10 }}>Reserva de emergência</SectionTitle>
      <Card style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Shield color={colors.accent} size={18} strokeWidth={2.2} />
          <Text style={{ color: colors.ink, fontWeight: "700" }}>Meta da reserva</Text>
        </View>

        <Field
          label="Gasto mensal (R$)"
          value={gastoLocked ? gastoMensalManual : gastoEdit}
          onChangeText={(value) => {
            if (gastoLocked) return;
            setGastoEdit(formatInputCurrency(value));
          }}
          editable={!gastoLocked}
          keyboardType="number-pad"
          placeholder={
            gastosMediosMensais > 0
              ? `Auto: ${formatBRL(gastosMediosMensais)}`
              : "0,00"
          }
        />

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {gastoLocked ? (
            <Pill label="Editar gasto" selected={false} onPress={handleEditarGasto} />
          ) : (
            gastoEditDirty && (
              <Pill label="Salvar gasto" selected onPress={handleSalvarGasto} />
            )
          )}
          <Pill
            label="6 meses"
            selected={mesesReserva === "6"}
            onPress={() => setMesesReserva("6")}
          />
          <Pill
            label="12 meses"
            selected={mesesReserva === "12"}
            onPress={() => setMesesReserva("12")}
          />
        </View>

        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
          Contabiliza apenas ativos marcados como reserva de emergência.
        </Text>
        <Text style={{ color: colors.ink, fontSize: 22, fontWeight: "700" }}>
          {formatBRL(patrimonioEmergencia)}
          <Text style={{ color: colors.muted, fontSize: 14, fontWeight: "500" }}>
            {" "}
            / {formatBRL(metaReserva)}
          </Text>
        </Text>
        <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 10 }}>
          {metaReserva > 0
            ? `Gasto considerado: ${formatBRL(gastoEfetivo)} × ${mesesReserva} meses`
            : "Informe o gasto mensal ou cadastre gastos nas transações"}
        </Text>
        {metaReserva > 0 ? (
          <>
            <View
              style={{
                height: 10,
                borderRadius: 999,
                backgroundColor: colors.canvas,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${Math.min(100, pctReserva)}%`,
                  backgroundColor: pctReserva >= 100 ? colors.success : colors.warning,
                  borderRadius: 999,
                }}
              />
            </View>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}>
              {pctReserva.toFixed(0)}% da meta
              {pctReserva >= 100 ? " · Meta alcançada!" : ""}
            </Text>
          </>
        ) : null}
      </Card>

      <SectionTitle style={{ marginBottom: 10 }}>Ativos cadastrados</SectionTitle>
      {ativos.length === 0 ? (
        <Card style={{ marginBottom: 14 }}>
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            Nenhum ativo cadastrado. Toque em “Cadastrar ativo” para começar.
          </Text>
        </Card>
      ) : (
        <>
          {ativosPaginados.map((ativo) => {
            const preco = Number(ativo.preco_atual) || 0;
            const qtd = Number(ativo.quantidade) || 0;
            const diaPct = Number(ativo.variacao_dia_percentual);
            return (
              <Card key={ativo.id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
                      {ativo.ticker || ativo.nome}
                    </Text>
                    <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
                      {ativo.nome}
                    </Text>
                    <Text style={{ color: colors.accent, fontSize: 12, marginTop: 2 }}>
                      {TIPOS_LABEL[ativo.tipo] || ativo.tipo}
                      {qtd > 0 ? ` · ${qtd} un.` : ""}
                    </Text>
                    {preco > 0 ? (
                      <Text style={{ color: colors.ink, fontSize: 13, marginTop: 6, fontWeight: "600" }}>
                        {formatBRL(preco)}
                        {Number.isFinite(diaPct) ? (
                          <Text
                            style={{
                              color: diaPct >= 0 ? colors.success : colors.danger,
                              fontWeight: "600",
                            }}
                          >
                            {" "}
                            {diaPct >= 0 ? "+" : ""}
                            {diaPct.toFixed(2)}%
                          </Text>
                        ) : null}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <IconButton
                      onPress={() => openInvestimento(ativo)}
                      backgroundColor={colors.tintSuccess}
                    >
                      <PiggyBank color={colors.success} size={15} strokeWidth={2.2} />
                    </IconButton>
                    <IconButton
                      onPress={() => {
                        setAtivoParaEditar(ativo);
                        setShowEditarAtivo(true);
                      }}
                      backgroundColor={colors.tintWarning}
                    >
                      <Settings color={colors.warning} size={15} strokeWidth={2.2} />
                    </IconButton>
                    <IconButton
                      onPress={() => {
                        setAtivoParaExcluir(ativo);
                        setShowExcluir(true);
                      }}
                      backgroundColor={colors.tintDanger}
                    >
                      <Trash2 color={colors.danger} size={15} strokeWidth={2.2} />
                    </IconButton>
                  </View>
                </View>
                <Pressable
                  onPress={() => openInvestimento(ativo)}
                  style={{
                    marginTop: 12,
                    paddingVertical: 10,
                    borderRadius: 14,
                    backgroundColor: colors.tintSuccess,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.success, fontWeight: "700", fontSize: 13 }}>
                    Atualizar posição
                  </Text>
                </Pressable>
              </Card>
            );
          })}
          <Pagination
            page={pageAtivos}
            totalPages={totalPaginasAtivos}
            totalItems={ativos.length}
            label="ativos"
            colors={colors}
            onPrev={() => setPageAtivos((page) => Math.max(1, page - 1))}
            onNext={() => setPageAtivos((page) => Math.min(totalPaginasAtivos, page + 1))}
          />
        </>
      )}

      <View style={{ height: 10 }} />
      <AtivoTipoChart ativos={ativos} />
      <PatrimonioEvolutionChart historico={patrimonioFiltrado} />
      <CarteiraDailyChart historico={historicoDiario} />

      <SectionTitle style={{ marginBottom: 10 }}>Alocação ideal (~17% cada)</SectionTitle>
      <View style={{ gap: 10, marginBottom: 14 }}>
        {Object.entries(ALOCACAO_IDEAL).map(([tipo, alvo]) => {
          const atual = alocacaoPercentuais[tipo] || 0;
          const diff = atual - alvo * 100;
          return (
            <Card key={tipo} style={{ marginBottom: 0 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: colors.muted, fontSize: 13 }}>
                  {TIPOS_LABEL[tipo]}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12 }}>
                  meta {(alvo * 100).toFixed(0)}%
                </Text>
              </View>
              <Text style={{ color: colors.ink, fontWeight: "700", marginTop: 4 }}>
                {atual.toFixed(1)}%
              </Text>
              <View
                style={{
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: colors.canvas,
                  marginTop: 8,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${Math.min(100, atual)}%`,
                    backgroundColor: colors.accent,
                    borderRadius: 999,
                  }}
                />
              </View>
              {diff < -2 ? (
                <Text style={{ color: colors.warning, fontSize: 12, marginTop: 6 }}>
                  Investir mais:{" "}
                  {formatBRL(alvo * patrimonioTotal - (alocacaoAtual[tipo] || 0))}
                </Text>
              ) : null}
            </Card>
          );
        })}
      </View>

      <SimuladorJuros patrimonioAtual={patrimonioTotal} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <SectionTitle style={{ marginBottom: 0 }}>Histórico patrimonial</SectionTitle>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pill
            label={showFiltro ? "Ocultar" : "Filtrar"}
            selected={showFiltro}
            onPress={() => setShowFiltro((current) => !current)}
          />
          <Pill label="Snapshot" selected onPress={() => setShowSnapshot(true)} />
        </View>
      </View>

      {showFiltro ? (
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
            Período no formato AAAA-MM
          </Text>
          <TextInput
            value={periodoInicio}
            onChangeText={setPeriodoInicio}
            placeholder="De: 2024-01"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.canvas,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.ink,
              marginBottom: 8,
            }}
          />
          <TextInput
            value={periodoFim}
            onChangeText={setPeriodoFim}
            placeholder="Até: 2024-12"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.canvas,
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: colors.ink,
              marginBottom: 10,
            }}
          />
          <Pill
            label="Limpar filtro"
            selected={false}
            onPress={() => {
              setPeriodoInicio("");
              setPeriodoFim("");
            }}
          />
        </Card>
      ) : null}

      <Card style={{ marginBottom: 14 }}>
        {patrimonioFiltrado.length === 0 ? (
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            Nenhum registro no período. Toque em “Snapshot” para salvar o patrimônio atual.
          </Text>
        ) : (
          sortPatrimonioDesc(patrimonioFiltrado).map((item) => (
            <View
              key={item.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              }}
            >
              <Text style={{ color: colors.ink, fontWeight: "600" }}>
                {item.mes} / {item.ano}
              </Text>
              <Text style={{ color: colors.success, fontWeight: "700" }}>
                {formatBRL(item.total_patrimonio)}
              </Text>
            </View>
          ))
        )}
      </Card>

      <SectionTitle style={{ marginBottom: 10 }}>Seus investimentos</SectionTitle>
      {ativosComInvestimento.length === 0 ? (
        <Card style={{ marginBottom: 14 }}>
          <Text style={{ color: colors.muted, textAlign: "center" }}>
            Nenhum investimento cadastrado. Selecione um ativo e registre um aporte.
          </Text>
        </Card>
      ) : (
        <>
          {investimentosPaginados.map((ativo) => {
            const valorInvestido = Number(ativo.valor_investido || 0);
            const valorAtual = Number(ativo.valor_atual || 0);
            const lucro = valorAtual - valorInvestido;
            const pct = valorInvestido > 0 ? (lucro / valorInvestido) * 100 : 0;
            const status =
              lucro > 0 ? "Valorizado" : lucro < 0 ? "Desvalorizado" : "Neutro";
            const statusColor =
              lucro > 0 ? colors.success : lucro < 0 ? colors.danger : colors.ink;
            const dividendosAtivo = dividendosPorAtivoMap[ativo.id];

            return (
              <Card key={ativo.id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <Text style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
                        {ativo.nome}
                      </Text>
                      {ativo.emergencia ? (
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: colors.warning,
                            backgroundColor: colors.tintWarning,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 8,
                            overflow: "hidden",
                          }}
                        >
                          Emergência
                        </Text>
                      ) : null}
                    </View>
                    <Text style={{ color: colors.accent, fontSize: 12, marginTop: 2 }}>
                      {TIPOS_LABEL[ativo.tipo] || ativo.tipo}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <IconButton
                      onPress={() => openInvestimento(ativo)}
                      backgroundColor={colors.tintSuccess}
                    >
                      <PiggyBank color={colors.success} size={15} strokeWidth={2.2} />
                    </IconButton>
                    <IconButton
                      onPress={() => {
                        setAtivoParaEditarValor(ativo);
                        setShowEditarValor(true);
                      }}
                      backgroundColor={colors.accentSoft}
                    >
                      <Pencil color={colors.accent} size={15} strokeWidth={2.2} />
                    </IconButton>
                    <IconButton
                      onPress={() => {
                        setAtivoParaRemover(ativo);
                        setShowRemoverInvestimentos(true);
                      }}
                      backgroundColor={colors.tintWarning}
                    >
                      <Trash2 color={colors.warning} size={15} strokeWidth={2.2} />
                    </IconButton>
                  </View>
                </View>

                <View style={{ marginTop: 12, gap: 6 }}>
                  <Row
                    label="Status"
                    value={`${status}${pct !== 0 ? ` ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%` : ""}`}
                    valueColor={statusColor}
                    colors={colors}
                  />
                  {patrimonioTotal > 0 ? (
                    <Row
                      label="% do patrimônio"
                      value={`${((valorAtual / patrimonioTotal) * 100).toFixed(1)}%`}
                      valueColor={colors.accent}
                      colors={colors}
                    />
                  ) : null}
                  <Row label="Valor na carteira" value={formatBRL(valorAtual)} colors={colors} />
                  <Row label="Total investido" value={formatBRL(valorInvestido)} colors={colors} />
                  <Row
                    label="Lucro/Prejuízo"
                    value={`${lucro >= 0 ? "+" : ""}${formatBRL(lucro)}`}
                    valueColor={statusColor}
                    colors={colors}
                  />
                  {dividendosAtivo?.total > 0 ? (
                    <Row
                      label="Dividendos no mês"
                      value={formatBRL(dividendosAtivo.total)}
                      valueColor={colors.success}
                      colors={colors}
                    />
                  ) : null}
                </View>
              </Card>
            );
          })}
          <Pagination
            page={pageInvestimentos}
            totalPages={totalPaginasInvestimentos}
            totalItems={ativosComInvestimento.length}
            label="investimentos"
            colors={colors}
            onPrev={() => setPageInvestimentos((page) => Math.max(1, page - 1))}
            onNext={() =>
              setPageInvestimentos((page) => Math.min(totalPaginasInvestimentos, page + 1))
            }
          />
        </>
      )}

      <AtivoFormSheet
        visible={showModalAtivo}
        onClose={() => setShowModalAtivo(false)}
        onSave={async (payload) => {
          const result = await createAtivo(payload);
          if (!result?.error) {
            flash("Ativo cadastrado!");
            syncQuotes({ force: true, silent: true });
          }
          return result;
        }}
      />

      <CompletarAtivoSheet
        visible={showCompletarAtivo}
        ativo={ativoParaCompletar}
        onClose={() => {
          setShowCompletarAtivo(false);
          setAtivoParaCompletar(null);
        }}
        onSave={async (dados) => {
          if (!ativoParaCompletar?.id) return { error: new Error("Ativo inválido") };
          const result = await updateAtivo(ativoParaCompletar.id, dados);
          if (!result?.error) {
            flash("Ticker vinculado!");
            syncQuotes({ force: true, silent: true });
          }
          return result;
        }}
      />

      <InvestimentoFormSheet
        visible={showModalInvestimento}
        ativos={ativos}
        ativoPreSelecionado={ativoPreSelecionado}
        onClose={() => {
          setShowModalInvestimento(false);
          setAtivoPreSelecionado(null);
        }}
        onSave={async (ativo, dados) => {
          const result = await registerInvestimento(ativo, dados);
          if (!result?.error) flash("Posição atualizada!");
          return result;
        }}
      />

      <EditarAtivoSheet
        visible={showEditarAtivo}
        ativo={ativoParaEditar}
        onClose={() => {
          setShowEditarAtivo(false);
          setAtivoParaEditar(null);
        }}
        onSave={async (dados) => {
          const result = await updateAtivo(ativoParaEditar.id, dados);
          if (!result?.error) flash("Ativo atualizado!");
          return result;
        }}
      />

      <EditarValorSheet
        visible={showEditarValor}
        ativo={ativoParaEditarValor}
        onClose={() => {
          setShowEditarValor(false);
          setAtivoParaEditarValor(null);
        }}
        onSave={async (novoValor) => {
          const result = await updateAtivo(ativoParaEditarValor.id, {
            valor_atual: novoValor,
          });
          if (!result?.error) flash("Valor de mercado atualizado!");
          return result;
        }}
      />

      <ConfirmSheet
        visible={showExcluir}
        title="Excluir ativo"
        description={`Deseja excluir o ativo "${ativoParaExcluir?.nome || ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        ativo={ativoParaExcluir}
        loading={confirmLoading}
        onClose={() => {
          setShowExcluir(false);
          setAtivoParaExcluir(null);
        }}
        onConfirm={async () => {
          setConfirmLoading(true);
          const result = await deleteAtivo(ativoParaExcluir.id);
          setConfirmLoading(false);
          setShowExcluir(false);
          setAtivoParaExcluir(null);
          if (result?.error) {
            Alert.alert("Erro", "Não foi possível excluir o ativo.");
            return;
          }
          flash("Ativo excluído.");
        }}
      />

      <ConfirmSheet
        visible={showRemoverInvestimentos}
        title="Remover investimentos"
        description="O ativo permanecerá cadastrado. Apenas o valor investido será zerado."
        confirmLabel="Remover"
        confirmTone="warning"
        ativo={ativoParaRemover}
        loading={confirmLoading}
        onClose={() => {
          setShowRemoverInvestimentos(false);
          setAtivoParaRemover(null);
        }}
        onConfirm={async () => {
          setConfirmLoading(true);
          const result = await clearInvestimentosAtivo(ativoParaRemover);
          setConfirmLoading(false);
          setShowRemoverInvestimentos(false);
          setAtivoParaRemover(null);
          if (result?.error) {
            Alert.alert("Erro", "Não foi possível remover os investimentos.");
            return;
          }
          flash("Investimentos removidos.");
        }}
      />

      <ConfirmSheet
        visible={showSnapshot}
        title="Registrar snapshot"
        description={`Salvar o patrimônio atual (${formatBRL(patrimonioTotal)}) como snapshot do mês?`}
        confirmLabel="Registrar"
        confirmTone="warning"
        loading={confirmLoading}
        onClose={() => setShowSnapshot(false)}
        onConfirm={handleSnapshot}
      />
    </Screen>
  );
}

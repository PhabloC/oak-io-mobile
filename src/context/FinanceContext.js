import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import {
  calcValorizacaoMes,
  ensureMonthStartSnapshots,
  fetchMonthBaseline,
  groupProventosByAtivo,
  syncMarketDividends,
  syncMarketQuotes,
} from "../services/market";
import { useAuth } from "./AuthContext";
import { MESES, valorMercadoEfetivo } from "../utils/investimento";
import {
  MONTHS,
  currentMonthName,
  setRecurringMonthExcludedStatus,
  transactionMatchesMonth,
} from "../utils/transactions";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [debts, setDebts] = useState([
    { id: "d1", name: "Cartão", total: 2400, paid: 800 },
    { id: "d2", name: "Financiamento", total: 18000, paid: 6000 },
  ]);
  const [ativos, setAtivos] = useState([]);
  const [ativosLoading, setAtivosLoading] = useState(false);
  const [patrimonioHistorico, setPatrimonioHistorico] = useState([]);
  const [gastosMediosMensais, setGastosMediosMensais] = useState(0);
  const [valorizacaoMes, setValorizacaoMes] = useState({
    valor: 0,
    percentual: 0,
    patrimonioBase: 0,
    investidoBase: 0,
    aportesLiquidos: 0,
    snapshotDate: null,
    hasBaseline: false,
  });
  const [proventosMes, setProventosMes] = useState([]);
  const [dividendosMesTotal, setDividendosMesTotal] = useState(0);
  const [dividendosLoading, setDividendosLoading] = useState(false);
  const ativosRef = useRef(ativos);
  ativosRef.current = ativos;

  const loadTransactions = useCallback(async () => {
    if (!user?.id) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: queryError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", `${year}-01-01`)
      .lte("date", `${year}-12-31`)
      .order("date", { ascending: true });

    if (queryError) {
      setError("Não foi possível carregar as transações.");
      setLoading(false);
      return;
    }

    setTransactions(data || []);
    setLoading(false);
  }, [user?.id, year]);

  const loadGoals = useCallback(async () => {
    if (!user?.id) {
      setGoals([]);
      return;
    }

    setGoalsLoading(true);
    const { data, error: queryError } = await supabase
      .from("metas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      setGoalsLoading(false);
      return;
    }

    setGoals(data || []);
    setGoalsLoading(false);
  }, [user?.id]);

  const loadAtivos = useCallback(async () => {
    if (!user?.id) {
      setAtivos([]);
      return [];
    }

    setAtivosLoading(true);
    const { data, error: queryError } = await supabase
      .from("ativos")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const lista = queryError ? ativosRef.current : data || [];
    if (!queryError) setAtivos(lista);
    setAtivosLoading(false);
    return lista;
  }, [user?.id]);

  const loadPatrimonioHistorico = useCallback(async () => {
    if (!user?.id) {
      setPatrimonioHistorico([]);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("patrimonio_historico")
      .select("*")
      .eq("user_id", user.id)
      .order("ano", { ascending: true })
      .order("mes");

    if (!queryError) setPatrimonioHistorico(data || []);
  }, [user?.id]);

  const loadGastosMediosMensais = useCallback(async () => {
    if (!user?.id) {
      setGastosMediosMensais(0);
      return;
    }

    const hoje = new Date();
    const dataFim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 6, 1);
    const startDate = dataInicio.toISOString().slice(0, 10);
    const endDate = dataFim.toISOString().slice(0, 10);

    const { data, error: queryError } = await supabase
      .from("transactions")
      .select("date, type, value, todos_meses")
      .eq("user_id", user.id)
      .eq("type", "Gasto")
      .gte("date", startDate)
      .lte("date", endDate);

    if (queryError) return;

    const monthKeys = [];
    const cursor = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), 1);
    const end = new Date(dataFim.getFullYear(), dataFim.getMonth(), 1);
    while (cursor <= end) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, "0");
      monthKeys.push(`${y}-${m}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const porMes = {};
    (data || []).forEach((transaction) => {
      const absVal = Math.abs(Number(transaction.value) || 0);
      if (transaction.todos_meses) {
        monthKeys.forEach((key) => {
          porMes[key] = (porMes[key] || 0) + absVal;
        });
      } else {
        const [y, m] = (transaction.date || "").split("-");
        const key = `${y}-${m}`;
        if (!porMes[key]) porMes[key] = 0;
        porMes[key] += absVal;
      }
    });

    const mesesComDados = Object.keys(porMes);
    const total = mesesComDados.reduce((sum, key) => sum + porMes[key], 0);
    setGastosMediosMensais(mesesComDados.length > 0 ? total / mesesComDados.length : 0);
  }, [user?.id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  useEffect(() => {
    loadAtivos();
    loadPatrimonioHistorico();
    loadGastosMediosMensais();
  }, [loadAtivos, loadPatrimonioHistorico, loadGastosMediosMensais]);

  const monthTransactions = useMemo(
    () => transactions.filter((item) => transactionMatchesMonth(item, selectedMonth)),
    [transactions, selectedMonth],
  );

  const summary = useMemo(() => {
    const sum = (type) =>
      monthTransactions
        .filter((item) => item.type === type)
        .reduce((acc, item) => acc + Math.abs(Number(item.value) || 0), 0);
    const receita = sum("Ganho");
    const despesa = sum("Gasto");
    const investimento = sum("Investimento");
    return { receita, despesa, investimento, saldo: receita - despesa - investimento };
  }, [monthTransactions]);

  const dividendosPorAtivo = useMemo(
    () => groupProventosByAtivo(proventosMes),
    [proventosMes],
  );

  const addTransaction = async (transaction) => {
    if (!user?.id) return { error: new Error("Sem sessão") };

    const { data, error: insertError } = await supabase
      .from("transactions")
      .insert([{ ...transaction, user_id: user.id }])
      .select()
      .single();

    if (insertError) return { error: insertError };
    setTransactions((current) => [...current, data]);
    return { data };
  };

  const updateTransaction = async (transactionId, updates) => {
    if (!user?.id) return { error: new Error("Sem sessão") };

    const { data, error: updateError } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) return { error: updateError };
    setTransactions((current) =>
      current.map((item) => (item.id === transactionId ? data : item)),
    );
    return { data };
  };

  const deleteTransaction = async (transactionId) => {
    if (!user?.id) return { error: new Error("Sem sessão") };

    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", user.id);

    if (deleteError) return { error: deleteError };
    setTransactions((current) => current.filter((item) => item.id !== transactionId));
    return { data: true };
  };

  const excludeTransactionFromMonth = async (transaction, monthName) => {
    if (!user?.id) return { error: new Error("Sem sessão") };
    if (!transaction?.id) return { error: new Error("Transação inválida") };

    const excluido_meses = setRecurringMonthExcludedStatus(transaction, monthName, true);
    const { data, error: updateError } = await supabase
      .from("transactions")
      .update({ excluido_meses })
      .eq("id", transaction.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) return { error: updateError };
    setTransactions((current) =>
      current.map((item) => (item.id === transaction.id ? data : item)),
    );
    return { data };
  };

  const addGoal = async (goal) => {
    if (!user?.id) return { error: new Error("Sem sessão") };

    const payload = {
      title: goal.title,
      target_value: goal.target_value,
      current_value: goal.current_value ?? 0,
      deadline: goal.deadline || null,
      category: goal.category || "Economia",
      image_url: goal.image_url || null,
      completed: false,
      user_id: user.id,
    };

    const { data, error: insertError } = await supabase
      .from("metas")
      .insert([payload])
      .select()
      .single();

    if (insertError) return { error: insertError };
    setGoals((current) => [data, ...current]);
    return { data };
  };

  const addDebt = (debt) => {
    setDebts((current) => [{ ...debt, id: String(Date.now()) }, ...current]);
  };

  const payDebt = (id, amount) => {
    setDebts((current) =>
      current.map((debt) => (debt.id === id ? { ...debt, paid: Math.min(debt.total, debt.paid + amount) } : debt)),
    );
  };

  const createAtivo = async (payload) => {
    if (!user?.id) return { error: new Error("Sem sessão") };

    const fullPayload = { ...payload, user_id: user.id };
    let { data, error: insertError } = await supabase
      .from("ativos")
      .insert([fullPayload])
      .select()
      .single();

    // Fallback se migration 009 ainda nao foi aplicada
    if (insertError) {
      const legacyPayload = {
        nome: payload.nome,
        ticker: payload.ticker ?? null,
        tipo: payload.tipo,
        valor_investido: payload.valor_investido ?? 0,
        valor_atual: payload.valor_atual ?? 0,
        quantidade: payload.quantidade ?? 1,
        data_compra: payload.data_compra,
        taxa_selic_anual: payload.taxa_selic_anual ?? null,
        emergencia: payload.emergencia ?? false,
        user_id: user.id,
      };
      // tipos novos podem falhar no check antigo — mapeia cripto/exterior
      if (legacyPayload.tipo === "cripto" || legacyPayload.tipo === "acoes_exterior") {
        legacyPayload.tipo = "exterior_cripto";
      }
      if (legacyPayload.tipo === "etf_exterior") {
        legacyPayload.tipo = "acoes";
      }

      const retry = await supabase.from("ativos").insert([legacyPayload]).select().single();
      data = retry.data;
      insertError = retry.error;
    }

    if (insertError) return { error: insertError };
    setAtivos((current) => [data, ...current]);
    return { data };
  };

  const updateAtivo = async (id, fields) => {
    if (!user?.id) return { error: new Error("Sem sessão") };

    const { error: updateError } = await supabase
      .from("ativos")
      .update(fields)
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) return { error: updateError };
    setAtivos((current) =>
      current.map((ativo) => (ativo.id === id ? { ...ativo, ...fields } : ativo)),
    );
    return { data: true };
  };

  const refreshProventosMes = useCallback(async () => {
    if (!user?.id) {
      setProventosMes([]);
      setDividendosMesTotal(0);
      return { total: 0, proventos: [] };
    }

    setDividendosLoading(true);
    try {
      const result = await syncMarketDividends();
      setProventosMes(result.proventos || []);
      setDividendosMesTotal(Number(result.total) || 0);
      return result;
    } catch {
      setProventosMes([]);
      setDividendosMesTotal(0);
      return { total: 0, proventos: [] };
    } finally {
      setDividendosLoading(false);
    }
  }, [user?.id]);

  const refreshValorizacaoMes = useCallback(
    async (ativosOverride = null) => {
      const lista = ativosOverride || ativosRef.current;
      const patrimonioAtual = lista.reduce(
        (sum, ativo) => sum + valorMercadoEfetivo(ativo),
        0,
      );
      const investidoAtual = lista.reduce(
        (sum, ativo) => sum + (Number(ativo.valor_investido) || 0),
        0,
      );

      try {
        const baseline = await ensureMonthStartSnapshots(lista);
        if (baseline?.error) {
          const fallback = await fetchMonthBaseline();
          setValorizacaoMes({
            ...calcValorizacaoMes(
              patrimonioAtual,
              fallback.patrimonioBase,
              investidoAtual,
              fallback.investidoBase ?? 0,
            ),
            snapshotDate: fallback.snapshotDate,
          });
          return;
        }
        setValorizacaoMes({
          ...calcValorizacaoMes(
            patrimonioAtual,
            baseline?.patrimonioBase || 0,
            investidoAtual,
            baseline?.investidoBase ?? 0,
          ),
          snapshotDate: baseline?.snapshotDate || null,
        });
      } catch {
        // ignore
      }
    },
    [],
  );

  const refreshAtivosQuotes = useCallback(
    async ({ force = false, ativosOverride = null } = {}) => {
      const lista = ativosOverride || ativosRef.current;
      const result = await syncMarketQuotes({
        ativos: lista,
        force,
        onAtivosUpdated: (patched) => {
          setAtivos((current) =>
            current.map((ativo) => {
              const next = patched.find((item) => item.id === ativo.id);
              return next ? { ...ativo, ...next } : ativo;
            }),
          );
        },
      });

      if (result.valorizacaoMes) {
        setValorizacaoMes({
          valor: Number(result.valorizacaoMes.valor) || 0,
          percentual: Number(result.valorizacaoMes.percentual) || 0,
          patrimonioBase: Number(result.valorizacaoMes.patrimonioBase) || 0,
          investidoBase: Number(result.valorizacaoMes.investidoBase) || 0,
          aportesLiquidos: Number(result.valorizacaoMes.aportesLiquidos) || 0,
          snapshotDate: result.valorizacaoMes.snapshotDate || null,
          hasBaseline: true,
        });
        if (result.source === "edge") {
          await loadAtivos();
        }
      } else {
        const nextAtivos = result.source === "edge" ? await loadAtivos() : lista;
        await refreshValorizacaoMes(nextAtivos);
      }

      // Dividendos em paralelo ao fim do sync de cotacoes (nao bloqueia UI)
      refreshProventosMes().catch(() => {});

      return result;
    },
    [loadAtivos, refreshProventosMes, refreshValorizacaoMes],
  );

  /**
   * Espelha a corretora: quantidade total + total investido.
   * valor_atual e preenchido depois pela cotacao (syncMarketQuotes).
   */
  const registerInvestimento = async (
    ativo,
    { quantidadeTotal, valorInvestidoTotal, emergencia = null } = {},
  ) => {
    if (!user?.id || !ativo) {
      return { error: new Error("Dados inválidos") };
    }

    const quantidade = Number(quantidadeTotal);
    const valorInvestido = Number(valorInvestidoTotal);
    if (!Number.isFinite(quantidade) || quantidade < 0) {
      return { error: new Error("Quantidade inválida") };
    }
    if (!Number.isFinite(valorInvestido) || valorInvestido < 0) {
      return { error: new Error("Valor investido inválido") };
    }

    const fields = {
      quantidade,
      valor_investido: valorInvestido,
    };
    if (emergencia !== null) fields.emergencia = emergencia;

    const preco = Number(ativo.preco_atual);
    if (Number.isFinite(preco) && preco > 0) {
      fields.valor_atual = quantidade * preco;
    }

    const result = await updateAtivo(ativo.id, fields);
    if (result?.error) return result;

    try {
      const merged = { ...ativo, ...fields };
      await refreshAtivosQuotes({
        force: true,
        ativosOverride: ativos.map((item) => (item.id === ativo.id ? merged : item)),
      });
    } catch {
      // dados do espelho ja salvos
    }

    return result;
  };

  const clearInvestimentosAtivo = async (ativo) => {
    if (!ativo?.id) return { error: new Error("Ativo inválido") };
    return updateAtivo(ativo.id, { valor_investido: 0 });
  };

  const deleteAtivo = async (id) => {
    if (!user?.id) return { error: new Error("Sem sessão") };

    const { error: deleteError } = await supabase
      .from("ativos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) return { error: deleteError };
    setAtivos((current) => current.filter((ativo) => ativo.id !== id));
    return { data: true };
  };

  const upsertPatrimonioSnapshot = async (totalPatrimonio) => {
    if (!user?.id) return { error: new Error("Sem sessão") };

    const hoje = new Date();
    const mes = MESES[hoje.getMonth()];
    const ano = hoje.getFullYear();

    const { error: upsertError } = await supabase.from("patrimonio_historico").upsert(
      { user_id: user.id, total_patrimonio: totalPatrimonio, mes, ano },
      { onConflict: "user_id,mes,ano" },
    );

    if (upsertError) return { error: upsertError };
    await loadPatrimonioHistorico();
    return { data: true };
  };

  return (
    <FinanceContext.Provider
      value={{
        months: MONTHS,
        selectedMonth,
        setSelectedMonth,
        selectedYear: year,
        transactions,
        monthTransactions,
        summary,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        excludeTransactionFromMonth,
        goals,
        goalsLoading,
        addGoal,
        loadGoals,
        debts,
        addDebt,
        payDebt,
        ativos,
        ativosLoading,
        patrimonioHistorico,
        gastosMediosMensais,
        valorizacaoMes,
        proventosMes,
        dividendosMesTotal,
        dividendosLoading,
        dividendosPorAtivo,
        loadAtivos,
        loadPatrimonioHistorico,
        createAtivo,
        updateAtivo,
        registerInvestimento,
        clearInvestimentosAtivo,
        deleteAtivo,
        upsertPatrimonioSnapshot,
        refreshAtivosQuotes,
        refreshValorizacaoMes,
        refreshProventosMes,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance deve ser usado dentro de FinanceProvider");
  }
  return context;
}

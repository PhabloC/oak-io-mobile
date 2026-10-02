import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { MONTHS, currentMonthName, transactionMatchesMonth } from "../utils/transactions";

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [goals, setGoals] = useState([
    { id: "g1", name: "Reserva de emergência", current: 8000, target: 15000 },
    { id: "g2", name: "Viagem", current: 3200, target: 6000 },
    { id: "g3", name: "Notebook", current: 4500, target: 4500 },
  ]);
  const [debts, setDebts] = useState([
    { id: "d1", name: "Cartão", total: 2400, paid: 800 },
    { id: "d2", name: "Financiamento", total: 18000, paid: 6000 },
  ]);
  const [assets, setAssets] = useState([
    { id: "a1", name: "Tesouro Selic", type: "Renda fixa", invested: 4200, current: 4510 },
    { id: "a2", name: "IVVB11", type: "ETF", invested: 2500, current: 2680 },
  ]);

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

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

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

  const addGoal = (goal) => {
    setGoals((current) => [{ ...goal, id: String(Date.now()) }, ...current]);
  };

  const addDebt = (debt) => {
    setDebts((current) => [{ ...debt, id: String(Date.now()) }, ...current]);
  };

  const payDebt = (id, amount) => {
    setDebts((current) =>
      current.map((debt) => (debt.id === id ? { ...debt, paid: Math.min(debt.total, debt.paid + amount) } : debt)),
    );
  };

  const addAsset = (asset) => {
    setAssets((current) => [{ ...asset, id: String(Date.now()) }, ...current]);
  };

  return (
    <FinanceContext.Provider
      value={{
        months: MONTHS,
        selectedMonth,
        setSelectedMonth,
        transactions,
        monthTransactions,
        summary,
        loading,
        error,
        addTransaction,
        goals,
        addGoal,
        debts,
        addDebt,
        payDebt,
        assets,
        addAsset,
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

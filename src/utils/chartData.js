import {
  MONTHS,
  parseTransactionDate,
  transactionMatchesMonth,
} from "./transactions";

export const CHART_COLORS = {
  receita: "#22c55e",
  despesa: "#ef4444",
  investimento: "#3b82f6",
};

function daysInMonth(monthName, year) {
  const monthIndex = MONTHS.indexOf(monthName);
  if (monthIndex < 0) return 30;
  return new Date(year, monthIndex + 1, 0).getDate();
}

function sumByType(list, type) {
  return list
    .filter((item) => item.type === type)
    .reduce((acc, item) => acc + Math.abs(Number(item.value) || 0), 0);
}

function transactionMatchesDayInMonth(transaction, selectedMonth, selectedYear, day) {
  if (!transactionMatchesMonth(transaction, selectedMonth)) return false;

  const parts = parseTransactionDate(transaction.date);
  if (!parts || parts.day !== day) return false;

  // Recorrente: entra no dia do mês em qualquer mês (respeitando exclusões acima).
  if (transaction.todos_meses) return true;

  const monthIndex = MONTHS.indexOf(selectedMonth) + 1;
  if (monthIndex < 1) return false;
  if (parts.month !== monthIndex) return false;
  if (selectedYear && parts.year !== selectedYear) return false;
  return true;
}

export function buildTransactionsSeries({
  transactions = [],
  selectedMonth,
  selectedYear,
  viewMode = "month",
}) {
  const year = selectedYear || new Date().getFullYear();

  if (viewMode === "month") {
    const totalDays = daysInMonth(selectedMonth, year);
    return Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      const dayTransactions = transactions.filter((item) =>
        transactionMatchesDayInMonth(item, selectedMonth, year, day),
      );

      return {
        label: String(day),
        receita: sumByType(dayTransactions, "Ganho"),
        despesa: sumByType(dayTransactions, "Gasto"),
        investimento: sumByType(dayTransactions, "Investimento"),
      };
    });
  }

  return MONTHS.map((month) => {
    const monthTransactions = transactions.filter((item) => {
      if (!transactionMatchesMonth(item, month)) return false;
      if (item.todos_meses) return true;
      const parts = parseTransactionDate(item.date);
      if (!parts) return item.month === month;
      return parts.year === year;
    });

    return {
      label: month.substring(0, 3),
      receita: sumByType(monthTransactions, "Ganho"),
      despesa: sumByType(monthTransactions, "Gasto"),
      investimento: sumByType(monthTransactions, "Investimento"),
    };
  });
}

export function buildDistributionData({
  transactions = [],
  selectedMonth,
  viewMode = "month",
}) {
  const scoped =
    viewMode === "all"
      ? transactions
      : transactions.filter((item) => transactionMatchesMonth(item, selectedMonth));

  return [
    {
      key: "ganhos",
      label: "Ganhos",
      value: sumByType(scoped, "Ganho"),
      color: CHART_COLORS.receita,
    },
    {
      key: "gastos",
      label: "Gastos",
      value: sumByType(scoped, "Gasto"),
      color: CHART_COLORS.despesa,
    },
    {
      key: "investimentos",
      label: "Investimentos",
      value: sumByType(scoped, "Investimento"),
      color: CHART_COLORS.investimento,
    },
  ].filter((item) => item.value > 0);
}

import { MONTHS, transactionMatchesMonth } from "./transactions";

export const CHART_COLORS = {
  receita: "#22c55e",
  despesa: "#ef4444",
  investimento: "#3b82f6",
};

function daysInMonth(monthName, year) {
  const monthIndex = MONTHS.indexOf(monthName);
  return new Date(year, monthIndex + 1, 0).getDate();
}

function sumByType(list, type) {
  return list
    .filter((item) => item.type === type)
    .reduce((acc, item) => acc + Math.abs(Number(item.value) || 0), 0);
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
      const daySuffix = `-${String(day).padStart(2, "0")}`;
      const dayTransactions = transactions.filter((item) => {
        if (!item.date?.endsWith(daySuffix)) return false;
        if (item.todos_meses) return true;
        return item.month === selectedMonth;
      });

      return {
        label: String(day),
        receita: sumByType(dayTransactions, "Ganho"),
        despesa: sumByType(dayTransactions, "Gasto"),
        investimento: sumByType(dayTransactions, "Investimento"),
      };
    });
  }

  return MONTHS.map((month) => {
    const monthTransactions = transactions.filter((item) =>
      transactionMatchesMonth(item, month),
    );
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

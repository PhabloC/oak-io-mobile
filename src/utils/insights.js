import { MONTHS } from "./transactions";

export function prevCalendarMonth(monthName, year) {
  const idx = MONTHS.indexOf(monthName);
  if (idx < 0) return { month: monthName, year };
  if (idx === 0) return { month: MONTHS[11], year: year - 1 };
  return { month: MONTHS[idx - 1], year };
}

export function belongsToCalendarMonth(transaction, year, monthName) {
  if (!transaction?.date) return false;
  const monthNum = MONTHS.indexOf(monthName) + 1;
  if (monthNum < 1) return false;
  if (transaction.todos_meses) {
    const ty = parseInt(String(transaction.date).split("-")[0], 10);
    return ty === year;
  }
  const parts = String(transaction.date).split("-");
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return y === year && m === monthNum;
}

export function getTopGastoCategories(monthTransactions, limit = 3) {
  const map = new Map();
  for (const t of monthTransactions) {
    if (t.type !== "Gasto") continue;
    const cat = (t.category && String(t.category).trim()) || "Sem categoria";
    const v = Math.abs(Number(t.value) || 0);
    map.set(cat, (map.get(cat) || 0) + v);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export function getComparativoGastos({
  monthTransactions,
  transactions,
  selectedMonth,
  selectedYear,
}) {
  const gastosAtual = monthTransactions
    .filter((t) => t.type === "Gasto")
    .reduce((acc, t) => acc + Math.abs(Number(t.value) || 0), 0);

  const { month: prevMonth, year: prevYear } = prevCalendarMonth(
    selectedMonth,
    selectedYear,
  );

  if (prevYear !== selectedYear) {
    return {
      kind: "cross_year",
      gastosAtual,
      prevMonth,
      prevYear,
    };
  }

  const gastosAnterior = transactions
    .filter(
      (t) =>
        t.type === "Gasto" && belongsToCalendarMonth(t, prevYear, prevMonth),
    )
    .reduce((acc, t) => acc + Math.abs(Number(t.value) || 0), 0);

  const diff = gastosAtual - gastosAnterior;
  let pct = 0;
  if (gastosAnterior > 0) {
    pct = (diff / gastosAnterior) * 100;
  } else if (gastosAtual > 0) {
    pct = 100;
  }

  return {
    kind: "ok",
    gastosAtual,
    gastosAnterior,
    prevMonth,
    pct,
  };
}

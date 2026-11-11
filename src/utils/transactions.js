export const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/** Extrai ano/mês/dia de `YYYY-MM-DD` ou ISO completo. */
export function parseTransactionDate(dateValue) {
  const raw = String(dateValue || "").slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
}

export function monthNameFromNumber(monthNumber) {
  const index = Number(monthNumber) - 1;
  if (index < 0 || index >= MONTHS.length) return null;
  return MONTHS[index];
}

export function monthNameFromDateValue(dateValue) {
  const parts = parseTransactionDate(dateValue);
  if (!parts) return null;
  return monthNameFromNumber(parts.month);
}

export function currentMonthName() {
  return MONTHS[new Date().getMonth()];
}

export function dateForMonth(monthName, year = new Date().getFullYear()) {
  const index = MONTHS.indexOf(monthName);
  const month = String((index >= 0 ? index : 0) + 1).padStart(2, "0");
  const now = new Date();
  const isCurrent = index === now.getMonth() && year === now.getFullYear();
  const day = String(isCurrent ? now.getDate() : 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeMonthKey(monthName) {
  return String(monthName || "").toLowerCase();
}

function getExcludedMonthsMap(transaction) {
  if (transaction?.excluido_meses && typeof transaction.excluido_meses === "object") {
    return transaction.excluido_meses;
  }
  return {};
}

export function setRecurringMonthExcludedStatus(transaction, monthName, excluded) {
  const monthKey = normalizeMonthKey(monthName);
  const current = getExcludedMonthsMap(transaction);

  if (!monthKey) return current;
  return { ...current, [monthKey]: Boolean(excluded) };
}

export function transactionMatchesMonth(transaction, monthName) {
  if (!transaction || !monthName) return false;

  if (transaction.todos_meses) {
    const monthKey = normalizeMonthKey(monthName);
    const excluded = getExcludedMonthsMap(transaction);
    return !Boolean(excluded[monthKey]);
  }

  // Data é a fonte da verdade; o campo `month` é fallback.
  const fromDate = monthNameFromDateValue(transaction.date);
  if (fromDate) return fromDate === monthName;
  return transaction.month === monthName;
}

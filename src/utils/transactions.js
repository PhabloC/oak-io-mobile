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

export function currentMonthName() {
  const name = new Date().toLocaleString("pt-BR", { month: "long" });
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function dateForMonth(monthName, year = new Date().getFullYear()) {
  const index = MONTHS.indexOf(monthName);
  const month = String((index >= 0 ? index : 0) + 1).padStart(2, "0");
  const now = new Date();
  const isCurrent = index === now.getMonth() && year === now.getFullYear();
  const day = String(isCurrent ? now.getDate() : 1).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function transactionMatchesMonth(transaction, monthName) {
  if (!transaction || !monthName) return false;
  if (transaction.todos_meses) {
    const monthKey = String(monthName).toLowerCase();
    const excluded = transaction.excluido_meses && typeof transaction.excluido_meses === "object" ? transaction.excluido_meses : {};
    return !excluded[monthKey];
  }
  return transaction.month === monthName;
}

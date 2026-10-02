export function formatBRL(value) {
  const amount = Math.abs(Number(value) || 0);
  const [integer, decimal] = amount.toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${grouped},${decimal}`;
}

export function amountColor(type) {
  if (type === "Gasto") return "text-red-300";
  if (type === "Investimento") return "text-sky-300";
  return "text-emerald-300";
}

export function signedAmount(type, value) {
  const formatted = formatBRL(value);
  return type === "Gasto" ? `- ${formatted}` : `+ ${formatted}`;
}

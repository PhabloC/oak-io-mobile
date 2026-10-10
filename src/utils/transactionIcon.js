function normalizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const CATEGORY_TO_ICON = {
  salario: "salario",
  freelance: "freelance",
  investimentos: "investimentos",
  presente: "presente",
  venda: "venda",
  alimentacao: "alimentacao",
  transporte: "transporte",
  saude: "saude",
  educacao: "educacao",
  lazer: "lazer",
  moradia: "moradia",
  roupas: "roupas",
  tecnologia: "tecnologia",
  contas: "contas",
  cdb: "cdb",
  "tesouro direto": "tesouro",
  acoes: "acoes",
  fiis: "fiis",
  criptomoedas: "criptomoedas",
  bitcoin: "bitcoin",
  btc: "bitcoin",
  poupanca: "poupanca",
  outros: "outros",
};

const TYPE_TO_ICON = {
  Ganho: "ganho",
  Gasto: "gasto",
  Investimento: "investimentos",
};

export function getTransactionIconMeta(type, category) {
  const name =
    CATEGORY_TO_ICON[normalizeKey(category)] || TYPE_TO_ICON[type] || "outros";
  return { kind: "svg", name };
}

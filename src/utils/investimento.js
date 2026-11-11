export const TIPOS_ATIVO = [
  { value: "acoes", label: "Ações" },
  { value: "fiis", label: "FIIs" },
  { value: "tesouro_selic", label: "Tesouro Selic" },
  { value: "acoes_exterior", label: "Ações Exterior" },
  { value: "etf_exterior", label: "ETF Exterior" },
  { value: "cripto", label: "Criptomoedas" },
];

export const TIPOS_LABEL = Object.fromEntries(
  TIPOS_ATIVO.map((item) => [item.value, item.label]),
);

export const TIPO_COLORS = {
  acoes: "#3b82f6",
  fiis: "#22c55e",
  tesouro_selic: "#eab308",
  acoes_exterior: "#a855f7",
  etf_exterior: "#ec4899",
  cripto: "#f97316",
};

export const ALOCACAO_IDEAL = {
  acoes: 0.17,
  fiis: 0.17,
  tesouro_selic: 0.17,
  acoes_exterior: 0.16,
  etf_exterior: 0.16,
  cripto: 0.17,
};

export const MESES = [
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

export const STORAGE_GASTO_MENSAL = "oak_reserva_gasto_mensal";
export const STORAGE_MESES_RESERVA = "oak_reserva_meses";
export const STORAGE_GASTO_LOCK = "oak_reserva_gasto_lock";

export function formatInputCurrency(inputValue) {
  const digits = String(inputValue || "").replace(/\D/g, "");
  if (!digits) return "";
  const number = parseInt(digits, 10) / 100;
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrencyToNumber(inputValue) {
  if (!inputValue) return 0;
  return parseFloat(String(inputValue).replace(/\./g, "").replace(",", ".")) || 0;
}

export function valorMercadoEfetivo(ativo) {
  return Number(ativo?.valor_atual || 0);
}

export function dateForInput(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function buildTipoChartData(ativos = []) {
  const byTipo = ativos.reduce((acc, ativo) => {
    const tipo = ativo.tipo || "outros";
    acc[tipo] = (acc[tipo] || 0) + valorMercadoEfetivo(ativo);
    return acc;
  }, {});

  return Object.entries(byTipo)
    .filter(([, value]) => value > 0)
    .map(([tipo, value]) => ({
      key: tipo,
      label: TIPOS_LABEL[tipo] || tipo,
      value,
      color: TIPO_COLORS[tipo] || "#94a3b8",
    }));
}

export function mesIndex(mes) {
  const idx = MESES.findIndex((nome) =>
    nome.toLowerCase().startsWith(String(mes || "").toLowerCase().slice(0, 3)),
  );
  return idx >= 0 ? idx + 1 : 1;
}

export function filterPatrimonioHistorico(historico = [], periodoInicio, periodoFim) {
  if (!periodoInicio || !periodoFim) return historico;
  const [anoIni, mesIni] = periodoInicio.split("-").map(Number);
  const [anoFim, mesFim] = periodoFim.split("-").map(Number);
  return historico.filter((item) => {
    const value = (item.ano || 0) * 12 + mesIndex(item.mes);
    return value >= anoIni * 12 + mesIni && value <= anoFim * 12 + mesFim;
  });
}

export function sortPatrimonioDesc(historico = []) {
  return [...historico].sort((a, b) => {
    const valueA = (a.ano || 0) * 12 + MESES.indexOf(a.mes || "");
    const valueB = (b.ano || 0) * 12 + MESES.indexOf(b.mes || "");
    return valueB - valueA;
  });
}

export function calcularJurosCompostos(aporteMensal, taxaMensal, meses, valorInicial = 0) {
  const rate = taxaMensal / 100;
  const projecao = [];
  let total = valorInicial;

  for (let i = 0; i <= meses; i += 1) {
    if (i > 0) {
      total = total * (1 + rate) + aporteMensal;
    }
    projecao.push({
      mes: i,
      valor: total,
      label: i === 0 ? "Hoje" : `M${i}`,
    });
  }
  return projecao;
}

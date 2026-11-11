const TIPOS_COM_CATALOGO = new Set([
  "acoes",
  "fiis",
  "renda_fixa",
  "cripto",
  "acoes_exterior",
  "etf_exterior",
  "exterior_cripto",
]);

/**
 * Ativos antigos / incompletos que precisam reescolher ticker na busca da API.
 * Tesouro Selic (projeção) e status manual ficam de fora.
 */
export function needsTickerCompletion(ativo) {
  if (!ativo) return false;
  if (!TIPOS_COM_CATALOGO.has(ativo.tipo)) return false;
  if (ativo.cotacao_status === "manual" || ativo.cotacao_status === "sem_suporte") {
    return false;
  }
  if (ativo.cotacao_status === "ok" && (ativo.ticker_normalizado || ativo.ticker)) {
    return false;
  }
  const ticker = (ativo.ticker_normalizado || ativo.ticker || "").trim();
  if (!ticker) return true;
  // Tem ticker texto, mas nunca sincronizou cotacao com sucesso
  return !ativo.cotacao_status || ativo.cotacao_status === "erro" || ativo.cotacao_status === "ticker_invalido";
}

export function listAtivosPendentes(ativos = []) {
  return (ativos || []).filter(needsTickerCompletion);
}

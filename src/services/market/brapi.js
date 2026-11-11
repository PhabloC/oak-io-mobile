const BRAPI_BASE = "https://brapi.dev/api/v2";

function mapTipo(subType, assetType) {
  if (subType === "fii" || subType === "fi-infra" || subType === "fi-agro") return "fiis";
  if (assetType === "fund") return "fiis";
  return "acoes";
}

/** Busca tickers reais na brapi (endpoint publico). Preferir Edge Function em producao. */
export async function searchTickersDirect({ search, type, limit = 20 }) {
  const term = String(search || "").trim();
  if (term.length < 1) return [];

  const params = new URLSearchParams({
    search: term,
    limit: String(Math.min(limit, 50)),
    sortBy: "volume",
    sortOrder: "desc",
  });
  if (type === "stock" || type === "fund" || type === "bdr") {
    params.set("type", type);
  }

  const response = await fetch(`${BRAPI_BASE}/tickers?${params}`);
  if (!response.ok) {
    throw new Error("Nao foi possivel buscar ativos.");
  }

  const data = await response.json();
  return (data.results || []).map((item) => {
    const ticker = String(item.symbol || "").toUpperCase();
    return {
      ticker,
      tickerKey: ticker,
      nome: String(item.name || item.longName || item.symbol || ""),
      tipo: mapTipo(item.subType, item.assetType),
      logoUrl: item.logoUrl || null,
      precoHint: item.quote?.lastPrice != null ? Number(item.quote.lastPrice) : null,
      assetType: item.assetType || null,
      subType: item.subType || null,
      mercado: "b3",
    };
  });
}

/** Cotacoes diretas na brapi (endpoint publico). Preferir Edge Function em producao. */
export async function fetchQuotesDirect(tickers = []) {
  const unique = [...new Set(tickers.map((t) => String(t || "").toUpperCase().trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const quotes = [];
  for (let i = 0; i < unique.length; i += 20) {
    const batch = unique.slice(i, i + 20);
    const response = await fetch(
      `${BRAPI_BASE}/stocks/quote?symbols=${encodeURIComponent(batch.join(","))}`,
    );
    if (!response.ok) continue;
    const payload = await response.json();
    for (const item of payload.results || []) {
      const data = item.data || {};
      const ticker = String(item.symbol || item.requestedSymbol || "").toUpperCase();
      const preco = Number(data.regularMarketPrice);
      if (!ticker || !Number.isFinite(preco)) continue;
      quotes.push({
        ticker,
        preco,
        variacaoPercentual:
          data.regularMarketChangePercent != null
            ? Number(data.regularMarketChangePercent)
            : null,
        variacaoValor:
          data.regularMarketChange != null ? Number(data.regularMarketChange) : null,
        nome: data.longName || data.shortName || null,
        logoUrl: data.logourl || null,
        moeda: data.currency || "BRL",
      });
    }
  }
  return quotes;
}

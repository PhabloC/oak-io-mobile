const BRAPI_BASE = "https://brapi.dev/api/v2";
const YAHOO_UA = "Mozilla/5.0 (compatible; OakIO/1.0; +https://oak.io)";

const TESOURO_CATALOG = [
  {
    ticker: "SELIC",
    tickerKey: "SELIC",
    nome: "Tesouro Selic (projeção diária BCB)",
    tipo: "tesouro_selic",
    logoUrl: null,
    precoHint: null,
    mercado: "tesouro",
  },
  {
    ticker: "tesouro-selic-01032031",
    tickerKey: "tesouro-selic-01032031",
    nome: "Tesouro Selic 2031",
    tipo: "tesouro_selic",
    logoUrl: null,
    precoHint: null,
    mercado: "tesouro",
  },
  {
    ticker: "tesouro-prefixado-com-juros-semestrais-01012037",
    tickerKey: "tesouro-prefixado-com-juros-semestrais-01012037",
    nome: "Tesouro Prefixado com Juros Semestrais 2037",
    tipo: "tesouro_selic",
    logoUrl: null,
    precoHint: null,
    mercado: "tesouro",
  },
  {
    ticker: "tesouro-ipca-com-juros-semestrais-15082060",
    tickerKey: "tesouro-ipca-com-juros-semestrais-15082060",
    nome: "Tesouro IPCA+ com Juros Semestrais 2060",
    tipo: "tesouro_selic",
    logoUrl: null,
    precoHint: null,
    mercado: "tesouro",
  },
];

function mapB3Tipo(subType, assetType) {
  if (subType === "fii" || subType === "fi-infra" || subType === "fi-agro") return "fiis";
  if (assetType === "fund") return "fiis";
  return "acoes";
}

export async function searchCryptoDirect(search, limit = 20) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(search)}`,
  );
  if (!response.ok) return [];
  const data = await response.json();
  return (data.coins || []).slice(0, limit).map((coin) => ({
    ticker: String(coin.symbol || "").toUpperCase(),
    tickerKey: String(coin.id || "").toLowerCase(),
    nome: String(coin.name || coin.symbol || ""),
    tipo: "cripto",
    logoUrl: coin.thumb || null,
    precoHint: null,
    mercado: "crypto",
  }));
}

export async function searchExteriorDirect(search, limit = 20) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(search)}&quotesCount=${limit}&newsCount=0`,
    { headers: { "User-Agent": YAHOO_UA } },
  );
  if (!response.ok) return [];
  const data = await response.json();
  return (data.quotes || [])
    .filter((q) => q.quoteType === "EQUITY" || q.quoteType === "ETF")
    .slice(0, limit)
    .map((q) => {
      const ticker = String(q.symbol || "").toUpperCase();
      return {
        ticker,
        tickerKey: ticker,
        nome: String(q.shortname || q.longname || q.symbol || ""),
        tipo: q.quoteType === "ETF" ? "etf_exterior" : "acoes_exterior",
        logoUrl: null,
        precoHint: null,
        mercado: "exterior",
      };
    });
}

export function searchTesouroDirect(search, limit = 20) {
  const term = String(search || "").toLowerCase();
  return TESOURO_CATALOG.filter(
    (item) =>
      item.ticker.toLowerCase().includes(term) ||
      item.nome.toLowerCase().includes(term) ||
      term.includes("selic") ||
      term.includes("tesouro"),
  ).slice(0, limit);
}

export async function fetchUsdBrlDirect() {
  const response = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
  if (!response.ok) return null;
  const data = await response.json();
  const bid = Number(data?.USDBRL?.bid);
  return Number.isFinite(bid) && bid > 0 ? bid : null;
}

export async function fetchCryptoQuotesDirect(ids = []) {
  const unique = [...new Set(ids.map((id) => String(id || "").toLowerCase()).filter(Boolean))];
  if (!unique.length) return [];
  const quotes = [];
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    const url =
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(batch.join(","))}` +
      "&vs_currencies=brl&include_24hr_change=true";
    const response = await fetch(url);
    if (!response.ok) continue;
    const data = await response.json();
    for (const id of batch) {
      const row = data[id];
      if (!row || row.brl == null) continue;
      quotes.push({
        ticker: id,
        preco: Number(row.brl),
        variacaoPercentual: row.brl_24h_change != null ? Number(row.brl_24h_change) : null,
        variacaoValor: null,
        nome: null,
        logoUrl: null,
        moeda: "BRL",
      });
    }
  }
  return quotes;
}

export async function fetchExteriorQuotesDirect(tickers = []) {
  const usdBrl = await fetchUsdBrlDirect();
  if (!usdBrl) return [];
  const quotes = [];
  for (const symbol of [...new Set(tickers.map((t) => String(t || "").toUpperCase()).filter(Boolean))]) {
    try {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
        { headers: { "User-Agent": YAHOO_UA } },
      );
      if (!response.ok) continue;
      const payload = await response.json();
      const meta = payload?.chart?.result?.[0]?.meta;
      const usdPrice = Number(meta?.regularMarketPrice ?? meta?.previousClose);
      if (!Number.isFinite(usdPrice) || usdPrice <= 0) continue;
      const preco = usdPrice * usdBrl;
      const prev = Number(meta?.chartPreviousClose ?? meta?.previousClose);
      let variacaoPercentual = null;
      let variacaoValor = null;
      if (Number.isFinite(prev) && prev > 0) {
        const usdChange = usdPrice - prev;
        variacaoPercentual = (usdChange / prev) * 100;
        variacaoValor = usdChange * usdBrl;
      }
      quotes.push({
        ticker: symbol,
        preco,
        variacaoPercentual,
        variacaoValor,
        nome: meta?.longName || meta?.shortName || symbol,
        logoUrl: null,
        moeda: "BRL",
      });
    } catch {
      // ignore
    }
  }
  return quotes;
}

export async function fetchTreasuryQuotesDirect(symbols = []) {
  const real = symbols.filter((s) => String(s).toLowerCase().startsWith("tesouro-"));
  if (!real.length) return [];
  const quotes = [];
  for (let i = 0; i < real.length; i += 20) {
    const batch = real.slice(i, i + 20);
    const response = await fetch(
      `${BRAPI_BASE}/treasury/indicators?symbols=${encodeURIComponent(batch.join(","))}`,
    );
    if (!response.ok) continue;
    const payload = await response.json();
    for (const item of payload.results || []) {
      const ticker = String(item.symbol || "");
      const preco = Number(item.sellPrice ?? item.basePrice ?? item.buyPrice);
      if (!ticker || !Number.isFinite(preco)) continue;
      quotes.push({
        ticker,
        preco,
        variacaoPercentual: null,
        variacaoValor: null,
        nome: item.bondType || ticker,
        logoUrl: null,
        moeda: "BRL",
      });
    }
  }
  return quotes;
}

export async function fetchSelicDailyPercentDirect() {
  const response = await fetch(
    "https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados/ultimos/1?formato=json",
  );
  if (!response.ok) return null;
  const data = await response.json();
  const valor = Number(String(data?.[0]?.valor || "").replace(",", "."));
  return Number.isFinite(valor) ? valor : null;
}

export function daysSince(dateStr) {
  if (!dateStr) return 0;
  const start = new Date(`${String(dateStr).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(start.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
}

export function calcSelicAccrual(valorInvestido, dailyPercent, days) {
  if (!(valorInvestido > 0) || !(dailyPercent > 0) || days <= 0) return valorInvestido;
  return valorInvestido * (1 + dailyPercent / 100) ** days;
}

export { mapB3Tipo, TESOURO_CATALOG };

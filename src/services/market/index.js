import { supabase } from "../../lib/supabase";
import { fetchQuotesDirect, searchTickersDirect } from "./brapi";
import {
  calcSelicAccrual,
  daysSince,
  fetchCryptoQuotesDirect,
  fetchExteriorQuotesDirect,
  fetchSelicDailyPercentDirect,
  fetchTreasuryQuotesDirect,
  searchCryptoDirect,
  searchExteriorDirect,
  searchTesouroDirect,
} from "./providers";
import {
  calcValorizacaoMes,
  ensureMonthStartSnapshots,
} from "./snapshots";

export {
  calcValorizacaoMes,
  ensureMonthStartSnapshots,
  fetchMonthBaseline,
  monthStartDate,
} from "./snapshots";

export {
  groupProventosByAtivo,
  loadProventosMes,
  monthPaymentBounds,
  syncMarketDividends,
} from "./dividends";

export async function fetchCarteiraHistorico(limit = 90) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return [];

  const { data, error } = await supabase
    .from("carteira_snapshots")
    .select("snapshot_date, patrimonio_total")
    .eq("user_id", user.id)
    .order("snapshot_date", { ascending: true })
    .limit(limit);

  if (error) return [];
  return data || [];
}

function quoteKey(ativo) {
  const raw = (ativo?.ticker_normalizado || ativo?.ticker || "").trim();
  if (ativo?.tipo === "cripto" || ativo?.tipo === "exterior_cripto") return raw.toLowerCase();
  if (ativo?.tipo === "tesouro_selic") return raw;
  return raw.toUpperCase();
}

export function isAtivoCotavel(ativo) {
  if (!ativo) return false;
  if (ativo.cotacao_status === "manual" && ativo.tipo !== "tesouro_selic") return false;
  const key = quoteKey(ativo);
  if (!key && ativo.tipo !== "tesouro_selic") return false;
  return [
    "acoes",
    "fiis",
    "renda_fixa",
    "cripto",
    "acoes_exterior",
    "etf_exterior",
    "tesouro_selic",
    "exterior_cripto",
  ].includes(ativo.tipo);
}

export async function searchMarketTickers({ search, type, market = "b3", limit = 20 } = {}) {
  try {
    const { data, error } = await supabase.functions.invoke("market-tickers", {
      body: { search, type, market, limit },
    });
    if (!error && Array.isArray(data?.results)) {
      return data.results;
    }
  } catch {
    // fallback abaixo
  }

  const m = String(market || type || "b3").toLowerCase();
  if (m === "crypto") return searchCryptoDirect(search, limit);
  if (m === "exterior") return searchExteriorDirect(search, limit);
  if (m === "tesouro") return searchTesouroDirect(search, limit);
  return searchTickersDirect({ search, type, limit });
}

async function fetchQuotesForAtivos(ativos = []) {
  const b3 = [];
  const crypto = [];
  const exterior = [];
  const treasury = [];
  const selicAccrual = [];

  for (const ativo of ativos) {
    const key = quoteKey(ativo);
    if (ativo.tipo === "cripto" || ativo.tipo === "exterior_cripto") crypto.push(key);
    else if (ativo.tipo === "acoes_exterior" || ativo.tipo === "etf_exterior") exterior.push(key);
    else if (ativo.tipo === "tesouro_selic") {
      if (key.toUpperCase() === "SELIC" || !String(key).toLowerCase().startsWith("tesouro-")) {
        selicAccrual.push(ativo);
      } else treasury.push(key);
    } else b3.push(key);
  }

  const [b3Quotes, cryptoQuotes, exteriorQuotes, treasuryQuotes, selicDaily] =
    await Promise.all([
      fetchQuotesDirect(b3),
      fetchCryptoQuotesDirect(crypto),
      fetchExteriorQuotesDirect(exterior),
      fetchTreasuryQuotesDirect(treasury),
      selicAccrual.length ? fetchSelicDailyPercentDirect() : Promise.resolve(null),
    ]);

  const quoteMap = Object.fromEntries(
    [...b3Quotes, ...cryptoQuotes, ...exteriorQuotes, ...treasuryQuotes].map((q) => [
      q.ticker,
      q,
    ]),
  );

  return { quoteMap, selicAccrual, selicDaily };
}

/**
 * Atualiza precos dos ativos do usuario (B3, cripto, exterior, Tesouro).
 */
export async function syncMarketQuotes({ ativos = [], force = false, onAtivosUpdated } = {}) {
  try {
    const { data, error } = await supabase.functions.invoke("market-quotes", {
      body: { force },
    });
    if (!error && typeof data?.updated === "number") {
      return {
        updated: data.updated,
        source: "edge",
        quotes: data.quotes || [],
        valorizacaoMes: data.valorizacaoMes || null,
      };
    }
  } catch {
    // fallback abaixo
  }

  const cotaveis = ativos.filter(isAtivoCotavel);
  const { quoteMap, selicAccrual, selicDaily } = await fetchQuotesForAtivos(cotaveis);
  let updated = 0;
  const patched = [];

  for (const ativo of cotaveis) {
    const key = quoteKey(ativo);
    const quantidade = Number(ativo.quantidade) || 0;

    if (selicAccrual.some((item) => item.id === ativo.id)) {
      const investido = Number(ativo.valor_investido) || 0;
      const dias = daysSince(ativo.data_compra);
      let valorAtual = investido;
      if (selicDaily != null) {
        valorAtual = calcSelicAccrual(investido, selicDaily, dias);
      } else if (ativo.taxa_selic_anual) {
        valorAtual = investido * (1 + Number(ativo.taxa_selic_anual) / 100) ** (dias / 365);
      }
      const preco = quantidade > 0 ? valorAtual / quantidade : valorAtual;
      const fields = {
        preco_atual: preco,
        valor_atual: valorAtual,
        variacao_dia_percentual: selicDaily,
        preco_atualizado_em: new Date().toISOString(),
        ticker_normalizado: key.toUpperCase() === "SELIC" ? "SELIC" : key,
        cotacao_status: "ok",
        moeda: "BRL",
      };
      const { error } = await supabase.from("ativos").update(fields).eq("id", ativo.id);
      if (!error) {
        updated += 1;
        patched.push({ ...ativo, ...fields });
      }
      continue;
    }

    const quote = quoteMap[key] || quoteMap[key.toUpperCase()] || quoteMap[key.toLowerCase()];
    if (!quote) continue;

    const fields = {
      preco_atual: quote.preco,
      valor_atual: quantidade * quote.preco,
      variacao_dia_percentual: quote.variacaoPercentual,
      variacao_dia_valor: quote.variacaoValor,
      preco_atualizado_em: new Date().toISOString(),
      ticker_normalizado: key,
      cotacao_status: "ok",
      moeda: quote.moeda,
      logo_url: quote.logoUrl,
    };

    let { error } = await supabase.from("ativos").update(fields).eq("id", ativo.id);
    if (error) {
      const fallback = { valor_atual: quantidade * quote.preco };
      const retry = await supabase.from("ativos").update(fallback).eq("id", ativo.id);
      error = retry.error;
      if (!error) {
        updated += 1;
        patched.push({ ...ativo, ...fallback, preco_atual: quote.preco });
      }
      continue;
    }

    updated += 1;
    patched.push({ ...ativo, ...fields });
  }

  const mergedAtivos = (ativos || []).map((ativo) => {
    const next = patched.find((item) => item.id === ativo.id);
    return next || ativo;
  });

  let valorizacaoMes = null;
  try {
    const baseline = await ensureMonthStartSnapshots(mergedAtivos);
    if (baseline && !baseline.error) {
      const patrimonioAtual = mergedAtivos.reduce(
        (sum, ativo) => sum + (Number(ativo.valor_atual) || 0),
        0,
      );
      const investidoAtual = mergedAtivos.reduce(
        (sum, ativo) => sum + (Number(ativo.valor_investido) || 0),
        0,
      );
      valorizacaoMes = {
        ...calcValorizacaoMes(
          patrimonioAtual,
          baseline.patrimonioBase,
          investidoAtual,
          baseline.investidoBase ?? 0,
        ),
        snapshotDate: baseline.snapshotDate,
      };
    }
  } catch {
    // ignore
  }

  if (typeof onAtivosUpdated === "function" && patched.length > 0) {
    onAtivosUpdated(patched);
  }

  return { updated, source: "direct", quotes: Object.values(quoteMap), valorizacaoMes };
}

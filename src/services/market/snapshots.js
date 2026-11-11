import { supabase } from "../../lib/supabase";

/** Data do 1º dia do mês corrente em America/Sao_Paulo (YYYY-MM-01). */
export function monthStartDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  return `${year}-${month}-01`;
}

/**
 * Valorizacao do mes descontando aportes/resgates no periodo.
 * valorizacao = (patrimonioAtual - patrimonioBase) - (investidoAtual - investidoBase)
 */
export function calcValorizacaoMes(
  patrimonioAtual,
  patrimonioBase,
  investidoAtual = null,
  investidoBase = null,
) {
  const atual = Number(patrimonioAtual) || 0;
  const base = Number(patrimonioBase) || 0;
  const invAtual = investidoAtual == null ? null : Number(investidoAtual) || 0;
  const invBase = investidoBase == null ? null : Number(investidoBase) || 0;

  const deltaMercado = atual - base;
  const aportesLiquidos =
    invAtual != null && invBase != null ? invAtual - invBase : 0;
  const valor = deltaMercado - aportesLiquidos;
  const percentual = base > 0 ? (valor / base) * 100 : 0;

  return {
    valor,
    percentual,
    patrimonioBase: base,
    patrimonioAtual: atual,
    investidoBase: invBase ?? 0,
    investidoAtual: invAtual ?? 0,
    aportesLiquidos,
    hasBaseline: base > 0 || atual === 0,
  };
}

/**
 * Garante snapshot de início do mês para cada ativo (só insere se faltar).
 * Baseline da carteira = soma dos snapshots dos ativos (não sobrescreve ativo já snapshotado).
 */
export async function ensureMonthStartSnapshots(ativos = []) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) return null;

  const snapshotDate = monthStartDate();

  const { data: existing, error: existingError } = await supabase
    .from("ativo_snapshots")
    .select("ativo_id")
    .eq("user_id", user.id)
    .eq("snapshot_date", snapshotDate);

  if (existingError) {
    return { snapshotDate, patrimonioBase: 0, error: existingError };
  }

  const existingIds = new Set((existing || []).map((row) => row.ativo_id));
  const missing = (ativos || []).filter((ativo) => ativo?.id && !existingIds.has(ativo.id));

  if (missing.length > 0) {
    const rows = missing.map((ativo) => ({
      user_id: user.id,
      ativo_id: ativo.id,
      snapshot_date: snapshotDate,
      quantidade: Number(ativo.quantidade) || 0,
      preco: Number(ativo.preco_atual) || 0,
      valor_mercado: Number(ativo.valor_atual) || 0,
      valor_investido: Number(ativo.valor_investido) || 0,
    }));

    await supabase.from("ativo_snapshots").upsert(rows, {
      onConflict: "ativo_id,snapshot_date",
      ignoreDuplicates: true,
    });
  }

  const { data: snaps } = await supabase
    .from("ativo_snapshots")
    .select("valor_mercado, valor_investido")
    .eq("user_id", user.id)
    .eq("snapshot_date", snapshotDate);

  const patrimonioBase = (snaps || []).reduce(
    (sum, row) => sum + (Number(row.valor_mercado) || 0),
    0,
  );
  const investidoBase = (snaps || []).reduce(
    (sum, row) => sum + (Number(row.valor_investido) || 0),
    0,
  );

  await supabase.from("carteira_snapshots").upsert(
    {
      user_id: user.id,
      snapshot_date: snapshotDate,
      patrimonio_total: patrimonioBase,
    },
    { onConflict: "user_id,snapshot_date" },
  );

  // Historico diario: snapshot de hoje com patrimonio atual
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const patrimonioAtual = (ativos || []).reduce(
    (sum, ativo) => sum + (Number(ativo.valor_atual) || 0),
    0,
  );
  await supabase.from("carteira_snapshots").upsert(
    {
      user_id: user.id,
      snapshot_date: today,
      patrimonio_total: patrimonioAtual,
    },
    { onConflict: "user_id,snapshot_date" },
  );

  return { snapshotDate, patrimonioBase, investidoBase };
}

export async function fetchMonthBaseline() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { snapshotDate: monthStartDate(), patrimonioBase: 0, investidoBase: 0 };
  }

  const snapshotDate = monthStartDate();
  const { data: snaps } = await supabase
    .from("ativo_snapshots")
    .select("valor_mercado, valor_investido")
    .eq("user_id", user.id)
    .eq("snapshot_date", snapshotDate);

  const patrimonioBase = (snaps || []).reduce(
    (sum, row) => sum + (Number(row.valor_mercado) || 0),
    0,
  );
  const investidoBase = (snaps || []).reduce(
    (sum, row) => sum + (Number(row.valor_investido) || 0),
    0,
  );

  if (patrimonioBase === 0) {
    const { data } = await supabase
      .from("carteira_snapshots")
      .select("patrimonio_total")
      .eq("user_id", user.id)
      .eq("snapshot_date", snapshotDate)
      .maybeSingle();
    if (data) {
      return {
        snapshotDate,
        patrimonioBase: Number(data.patrimonio_total) || 0,
        investidoBase,
      };
    }
  }

  return { snapshotDate, patrimonioBase, investidoBase };
}

import { supabase } from "../../lib/supabase";
import { monthStartDate } from "./snapshots";

function monthEndDate(date = new Date()) {
  const start = monthStartDate(date);
  const [year, month] = start.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

export function monthPaymentBounds(date = new Date()) {
  return { start: monthStartDate(date), end: monthEndDate(date) };
}

/** Sync + lista proventos do mes via Edge Function (com fallback de leitura local). */
export async function syncMarketDividends() {
  try {
    const { data, error } = await supabase.functions.invoke("market-dividends", {
      body: {},
    });
    if (!error && data && typeof data.total === "number") {
      return {
        total: data.total,
        count: data.count || 0,
        proventos: data.proventos || [],
        start: data.start,
        end: data.end,
        source: "edge",
      };
    }
  } catch {
    // fallback abaixo
  }

  return loadProventosMes();
}

export async function loadProventosMes(date = new Date()) {
  const { start, end } = monthPaymentBounds(date);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { total: 0, count: 0, proventos: [], start, end, source: "local" };
  }

  const { data, error } = await supabase
    .from("proventos")
    .select("*")
    .eq("user_id", user.id)
    .gte("payment_date", start)
    .lte("payment_date", end)
    .order("payment_date", { ascending: false });

  if (error) {
    return { total: 0, count: 0, proventos: [], start, end, source: "local", error };
  }

  const proventos = data || [];
  const total = proventos.reduce((sum, row) => sum + (Number(row.valor_total) || 0), 0);
  return {
    total,
    count: proventos.length,
    proventos,
    start,
    end,
    source: "local",
  };
}

export function groupProventosByAtivo(proventos = []) {
  const map = {};
  for (const row of proventos) {
    const key = row.ativo_id;
    if (!map[key]) {
      map[key] = { ativoId: key, ticker: row.ticker, total: 0, items: [] };
    }
    map[key].total += Number(row.valor_total) || 0;
    map[key].items.push(row);
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

# Plano: Cotações automáticas, valorização e dividendos

Documento de implementação para o módulo de Investimentos do Oak.io (mobile + web + Supabase).

---

## 1. Visão do produto (alinhada)

### 1.1 Como o usuário usa

1. **Investe na corretora** (Clear, Rico, XP, etc.) — o dinheiro e a ordem acontecem lá.
2. **Vem no Oak** e cadastra o ativo buscando na API (ex.: digita “PETR” → escolhe **PETR4 – Petrobras** da lista real da B3).
3. Informa **quantidade** e **quanto investiu** (espelho do que fez na corretora).
4. O app **puxa sozinho a cotação** desse ativo e mostra:
   - quanto a posição vale agora;
   - se valorizou ou desvalorizou (vs. o que ele investiu);
   - valorização no mês;
   - dividendos / proventos do mês.

O Oak **não é a corretora**. É o espelho da carteira: o usuário escolhe o ativo real no catálogo da API e informa o aporte; o mercado informa o preço.

### 1.2 Duas fontes de verdade (importante)

| O quê | De onde vem |
|-------|-------------|
| **Catálogo de ativos do mercado** (PETR4, VALE3, HGLG11…) | API brapi — busca / autocomplete |
| **Carteira do usuário** (o que *ele* tem) | Supabase — o que ele escolheu e registrou no Oak |
| **Preço / valorização / dividendos** | API brapi, com base no ticker da carteira |

Hoje o cadastro é texto livre (estático/manual). Com a integração, o usuário **não inventa ticker**: seleciona um ativo real retornado pela API.

### 1.3 O que some / muda em relação ao fluxo atual

| Hoje | Depois |
|------|--------|
| Nome/ticker digitados à mão (podem estar errados) | Busca na API → seleciona ativo real (nome, ticker, logo, tipo) |
| Usuário informa “valor na corretora” manualmente a cada aporte | App calcula `quantidade × preço da API` |
| Botão “editar valor de mercado” como caminho principal | Vira fallback (ativo sem cotação / Tesouro) |
| Lucro depende de o usuário atualizar o número | Lucro atualiza quando a cotação atualiza |

### 1.4 Dados que o usuário informa

Ao cadastrar um ativo / investimento:

| Campo | Obrigatório | Origem |
|-------|-------------|--------|
| Ativo (ticker + nome) | Sim (B3) | **Selecionado na busca da API** |
| Tipo | Sim | Inferido pela API (`stock`→ações, `fii`→fiis) ou confirmado |
| Quantidade (cotas/ações) | Sim | Usuário (o que tem na corretora) |
| Valor investido (R$) | Sim | Usuário (quanto pagou / total aportado) |
| Reserva de emergência | Não | Usuário (flag) |

O app preenche sozinho:

| Campo | Origem |
|-------|--------|
| Preço unitário atual | API (brapi) |
| Valor de mercado atual | `quantidade × preço` |
| Variação do dia | API |
| Lucro/prejuízo total | `valor_mercado − valor_investido` |
| Valorização do mês | snapshot início do mês vs agora |
| Dividendos do mês | API × quantidade |

### 1.5 Exemplo concreto

1. Compra 100 cotas de MXRF11 na corretora por R$ 10,00 → gastou R$ 1.000.
2. No Oak: busca “MXRF” → seleciona **MXRF11** na lista da API → quantidade `100`, valor investido `R$ 1.000`.
3. Cotação atual na API: R$ 10,40.
4. App mostra:
   - Valor na carteira: **R$ 1.040**
   - Valorização: **+ R$ 40 · +4%**
5. No mês, o FII paga R$ 0,09/cota → app mostra dividendos: **R$ 9,00**.

---

## 2. Objetivo da entrega

Na página de Investimentos o usuário:

1. **Busca e seleciona ativos reais** da B3 via API (não digita ticker “no escuro”).
2. Vê **cotações atualizadas** dos ativos da carteira.
3. Vê **valorização** da posição (vs. investido) e **valorização do mês**.
4. Vê **dividendos / proventos do mês**, com detalhe por ativo.

Mobile (`oak-io-mobile`) e web (`oak-io-front`), mesmo Supabase.

---

## 3. Estado atual (baseline)

| Peça | Situação |
|------|----------|
| Tabela `ativos` | `nome`, `ticker`, `tipo`, `quantidade`, `valor_investido`, `valor_atual`, `emergencia`, `taxa_selic_anual` |
| Tabela `patrimonio_historico` | Snapshot mensal manual do patrimônio total |
| UI | Cadastro de ativo + aporte pedindo “valor na corretora” **manual** |
| Tipos na UI | `acoes`, `fiis`, `tesouro_selic`, `acoes_exterior`, `etf_exterior`, `cripto` |

Limitações:

- Cadastro de ativo é texto livre — sem catálogo real da B3.
- Sem sync com mercado.
- `quantidade` muitas vezes irrelevante (fica `1`).
- Sem base para valorização do mês nem dividendos automáticos.

---

## 4. Modelo mental da carteira

```
valor_mercado = quantidade × preço_api
lucro_total   = valor_mercado − valor_investido
```

- **Ações / FIIs (MVP):** ticker escolhido na busca da API + quantidade + valor investido.
- **Tesouro Selic / exterior / cripto:** fora do MVP de catálogo/cotação automática; continuam manuais ou entram depois.

### 4.1 Novo fluxo de “Cadastrar ativo” (catálogo da API)

1. Usuário abre “Cadastrar ativo”.
2. Digita na busca (mín. 2 caracteres): ticker ou nome (“petr”, “maxí”, “HGLG”).
3. App chama Edge Function `market-tickers` → brapi `GET /api/v2/tickers?search=...`.
4. Lista resultados reais: logo, ticker, nome, tipo (ação/FII/ETF/BDR).
5. Usuário **seleciona** um item → app preenche `ticker`, `nome`, `tipo` (mapeado) e opcionalmente já busca cotação.
6. Usuário informa quantidade e valor investido (ou faz isso depois em “Cadastrar investimento”).
7. Salva em `ativos` no Supabase (carteira do usuário).

Regras:
- Não permitir salvar ticker que não veio da seleção (ou validar via coverage antes do insert).
- Debounce ~300 ms na busca.
- Filtrar por tipo quando o usuário já escolheu “Ações” ou “FIIs” (`type=stock|fund`, `subType=fii`).
- Se já existe o mesmo `ticker` na carteira do usuário → avisar e oferecer ir para aporte.

### 4.2 Novo fluxo de “Cadastrar investimento”

1. Usuário escolhe um ativo **já na carteira** (cadastrado via busca).
2. Informa quantidade total na corretora + total investido (recomendado no MVP).
3. App atualiza `valor_investido` / `quantidade`.
4. App chama cotação → atualiza `preco_atual` e `valor_atual`.
5. UI mostra valorização sem pedir “valor na corretora”.

**Decisão de quantidade no aporte (recomendada):**  
Cada aporte adiciona quantidade e valor.  
`quantidade_nova = quantidade_antiga + qtd_comprada`  
`valor_investido_novo = valor_investido_antigo + valor_aporte`

Alternativa mais simples no MVP: usuário sempre informa a **quantidade total atual** e o **total investido acumulado** (como na corretora). Menos ledger, mais fácil de conciliar.

> Recomendação de produto: no MVP, pedir **quantidade total na corretora** + **total investido acumulado**. Assim o usuário só espelha o que vê na corretora, sem precisar lembrar cada aporte.

---

## 5. Escopo por fase

### Fase 0 — Fundações
- Ticker + quantidade obrigatórios para tipos com cotação.
- Ajustar formulários: tirar “valor na corretora” como input principal.
- Migration com colunas de cotação.
- Banner para completar ativos antigos (reescolher ticker na busca). ✅

### Fase 1 — Catálogo + cotações (MVP) ← entrega principal
- Provider: **brapi.dev** (ações e FIIs BR).
- Edge Function `market-tickers` — busca/autocomplete de ativos reais.
- Edge Function `market-quotes` — preço dos tickers da carteira.
- UI: campo de busca ao cadastrar ativo (lista da API, não texto livre).
- Ao abrir a tela / botão atualizar: busca preço e recalcula `valor_atual`.
- Cards mostram preço, valor de mercado e lucro vs. investido.

### Fase 2 — Valorização do mês ✅
- Snapshot do valor de mercado no início do mês (cron ou primeiro sync do mês).
- Card “Valorização no mês” (R$ e %).
- Como o usuário espelha a corretora, aportes no mês podem distorcer um pouco o % — MVP aceitável com subtítulo “vs. valor de mercado no início do mês”. Evolução: descontar variação de `valor_investido` no período. ✅
- Implementado: `ativo_snapshots` / `carteira_snapshots` no primeiro sync do mês; valorização = Δ patrimônio − Δ investido; card no mobile/web.

### Fase 3 — Dividendos ✅
- Sync brapi (ações + FIIs).
- `valor = rate × quantidade`.
- Card + lista no mês.
- Implementado: tabela `proventos`, Edge `market-dividends`, card/lista/mobile por ativo; filtro por `payment_date` do mês.

### Fase 4 — Exterior, cripto, Tesouro ✅
- Outros providers + câmbio + Selic.
- Implementado: busca/cotação por mercado (B3 brapi, cripto CoinGecko, exterior Yahoo+USD/BRL AwesomeAPI, Tesouro brapi PU ou projeção Selic BCB); UI com abas de mercado.

### Fase 5 — Polish ✅
- Cron diário pós-pregão, paridade web, histórico.
- Implementado: `market-cron` (22:00 UTC dias úteis) + snapshots diários; web com busca/cotações/valorização/dividendos; gráficos de histórico diário mobile/web.

---

## 6. APIs

### 6.1 Principal (Brasil): [brapi.dev](https://brapi.dev/docs)

| Uso | Endpoint |
|-----|----------|
| **Busca / autocomplete de ativos** | `GET /api/v2/tickers?search=PETR&type=stock\|fund&limit=20` |
| Cotação | `GET /api/v2/stocks/quote?symbols=PETR4,HGLG11` |
| Dividendos ações | `GET /api/v2/stocks/dividends?symbols=PETR4` |
| Dividendos FIIs | `GET /api/v2/fii/dividends?symbols=HGLG11` |
| Histórico | `GET /api/v2/stocks/historical?...` |
| Validar ticker | `GET /api/v2/tickers/coverage?symbols=PETR4` |

Docs busca: https://brapi.dev/docs/tickers — retorna `symbol`, `name`, `logoUrl`, `assetType`, `subType`, resumo de quote.

Auth: `Authorization: Bearer BRAPI_API_KEY` — **somente** na Edge Function.

### 6.2 Arquitetura

```
Corretora (mundo real)
        │
        │  usuário registra espelho
        ▼
[Mobile / Web] ── invoke('market-quotes') ──► [Edge Function]
                                                      │
                                                      ▼
                                                   [brapi]
                                                      │
                                                      ▼
                                               [Postgres / ativos]
```

Cliente nunca vê a API key.

---

## 7. Modelo de dados

### 7.1 Colunas novas em `ativos`

| Coluna | Uso |
|--------|-----|
| `preco_atual` | Preço unitário da API |
| `preco_atualizado_em` | Quando sincronizou |
| `moeda` | default `BRL` |
| `variacao_dia_percentual` | Da API |
| `variacao_dia_valor` | Da API |
| `ticker_normalizado` | `PETR4` uppercase |
| `cotacao_status` | `ok` \| `ticker_invalido` \| `sem_suporte` \| `erro` \| `manual` |

`valor_atual` continua existindo = **valor de mercado total** (`quantidade * preco_atual`), preenchido pela sync.

### 7.2 `cotacoes_cache` (global)

Cache por ticker para não repetir request entre usuários.

### 7.3 Snapshots (valorização do mês)

`ativo_snapshots` / `carteira_snapshots` com `snapshot_date`, quantidade, preço, valor_mercado.

### 7.4 `proventos`

Eventos de dividendo/JCP/rendimento com `rate`, `quantidade_base`, `valor_total`, datas, idempotência.

---

## 8. Edge Functions

### `market-tickers` (busca de ativos reais)
1. Auth → user.
2. Input: `{ "search": "petr", "type": "stock" | "fund" | null, "limit": 20 }`.
3. Chama brapi `/api/v2/tickers?search=...` (debounce fica no client).
4. Mapeia para formato Oak:

```json
{
  "ticker": "PETR4",
  "nome": "Petróleo Brasileiro S.A.",
  "tipo": "acoes",
  "logoUrl": "...",
  "precoHint": 36.65
}
```

Mapeamento `subType` → `tipo` Oak: `stock/unit`→`acoes`, `fii`→`fiis`, `etf`→(tratar como ação/FII BR ou tipo próprio depois), `bdr`→`acoes` (MVP) ou tipo dedicado.

5. Cache curto opcional (ex.: 10 min por query) para economizar cota.
6. Retorna lista para o autocomplete.

### `market-quotes`
1. Auth → user.
2. Tickers dos ativos cotáveis do usuário.
3. Cache fresco (ex.: 5–15 min)? Usa cache.
4. Senão, batch brapi → upsert cache → update `ativos` (`preco_atual`, `valor_atual = qtd * preco`, variações).
5. Retorna dados para a UI.

### `market-dividends`
1. Eventos do mês para tickers do usuário.
2. `valor_total = rate × quantidade`.
3. Upsert `proventos` → retorno agregado.

### `market-snapshots` (cron)
- Diário pós-pregão e/ou dia 1: grava snapshots para valorização do mês.

Secrets: `BRAPI_API_KEY`, `CRON_SECRET`. Nunca em `EXPO_PUBLIC_*` / `VITE_*`.

---

## 9. UI (mobile → web)

### Topo
1. Patrimônio (valor de mercado atual — da API)
2. **Valorização no mês**
3. **Dividendos no mês**
4. Lucro/prejuízo total (vs. investido)
5. Total investido (o que o usuário informou)

### Ações
- Refresh / pull-to-refresh / “Atualizado às HH:mm”
- Sem pedir valor de mercado no fluxo feliz

### Card do ativo
- Quantidade · preço unitário · valor de mercado
- Lucro vs. investido
- Variação do dia
- Dividendos do mês (se houver)

### Formulário de cadastrar ativo (novo)
1. **Busca de ativo** (campo principal) — resultados da API com logo + ticker + nome.
2. Tipo preenchido automaticamente (editável só se necessário).
3. Quantidade + valor investido (se já for registrar posição).
4. Flag reserva de emergência.

**Não** ter input livre de ticker como caminho principal.

### Formulário de investimento (aporte)
Campos:
- Ativo (lista da carteira já cadastrada)
- Quantidade total na corretora (ou quantidade deste aporte — conforme §4.2)
- Valor total investido (R$)
- Flag reserva de emergência  

**Não pedir** “valor atual na corretora”.

### Fallback manual
Só para `tesouro_selic`, `cotacao_status = sem_suporte` ou falha persistente da API.

---

## 10. Fórmulas

```
preco_atual     ← API
valor_atual     = quantidade × preco_atual
lucro_total     = valor_atual − valor_investido
lucro_total_%   = lucro_total / valor_investido × 100

valorizacao_mes = valor_atual_carteira − valor_snapshot_inicio_mes

dividendo_evento = rate × quantidade
dividendos_mes   = soma(eventos do mês)
```

---

## 11. Sprints

| Sprint | Entrega |
|--------|---------|
| A | Migrations + colunas + RLS |
| B | Edge Function `market-tickers` (busca) + `market-quotes` (preço) + cache |
| C | UI mobile: autocomplete de ativos reais + formulário espelho + sync + cards |
| D | Snapshots + card valorização do mês |
| E | Dividendos (function + card + lista) |
| F | Paridade web |
| G | Exterior / cripto / Selic |

---

## 12. Critérios de aceite (MVP)

- [ ] Ao cadastrar ativo, usuário **busca e seleciona** um ticker real da API (não texto livre).
- [ ] Nome, ticker e tipo vêm preenchidos a partir do resultado da API.
- [ ] Usuário informa quantidade + valor investido (espelho da corretora).
- [ ] App atualiza preço sozinho; `valor_atual = quantidade × preço`.
- [ ] Lucro/prejuízo aparece sem edição manual de mercado.
- [ ] Topo mostra valorização do mês e dividendos do mês.
- [ ] API key não vai no app.
- [ ] Ativo sem cotação (ex.: Tesouro) continua manual e não quebra o resto.
- [ ] Mesma conta vê os mesmos números no mobile e na web.

---

## 13. Decisões fechadas

| Tema | Decisão |
|------|---------|
| Papel do app | Espelho da corretora + cotação automática |
| Catálogo de ativos | Busca na API brapi (ativos reais da B3) |
| Carteira do usuário | Continua no Supabase (o que ele selecionou) |
| Input do usuário | Seleciona ativo na busca + quantidade + valor investido |
| Valor de mercado | Calculado pela API, não digitado |
| MVP de mercado | Brasil (ações + FIIs) via brapi |
| Exterior/cripto/Selic | Depois (Fase 4) |

## 14. Decisões de UX (fechadas para implementação)

1. **Aporte:** quantidade total + total investido (espelho da corretora).
2. **Dividendos:** filtrar por data de pagamento (Fase 3).
3. **Refresh:** ao abrir a tela + botão “Cotações” manual.
4. **brapi:** funciona sem key no momento; Edge Functions prontas para quando houver `BRAPI_API_KEY`.

---

## 15. Ordem de execução

```
1. Fechar UX do aporte (total vs delta) — item 1 da §14
2. Migration (Fase 0)
3. market-tickers (busca) + UI autocomplete  ← ativos reais
4. market-quotes + espelho quantidade/investido  ← preços
5. Valorização do mês (Fase 2)
6. Dividendos (Fase 3)
7. Web
8. Outros mercados
```

---

## 16. Referências

- brapi: https://brapi.dev/docs  
- Busca de tickers: https://brapi.dev/docs/tickers  
- Mobile: `src/screens/InvestimentoScreen.js`, `src/context/FinanceContext.js`  
- Web: `oak-io-front/src/pages/Investimento.jsx`  
- Migrations: `oak-io-front/supabase/migrations/`

---

*Visão confirmada: corretora investe → Oak busca ativo real na API → usuário registra aporte → API valoriza.*

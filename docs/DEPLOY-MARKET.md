# Deploy: cotações e busca de ativos

## 1. Rodar a migration no Supabase (obrigatório)

1. Abra o projeto Oak no [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **SQL Editor**.
3. Cole e execute o arquivo:

`oak-io-front/supabase/migrations/009_market_data_cotacoes.sql`

Sem isso, colunas como `preco_atual` e `ticker_normalizado` não existem. O app ainda atualiza `valor_atual` como fallback, mas o cadastro completo fica limitado.

## 2. (Opcional) Deploy das Edge Functions

O app já funciona com fallback direto na brapi. Para produção, faça deploy:

```bash
cd oak-io-front
npx supabase login
npx supabase link --project-ref yexlnisnjnclwerwymps
npx supabase secrets set BRAPI_API_KEY=sua_chave_aqui
npx supabase functions deploy market-tickers
npx supabase functions deploy market-quotes
```

Chave brapi: https://brapi.dev/dashboard

## 3. Testar no app

1. Recarregue o Expo.
2. Abra **Investimentos**.
3. **Cadastrar ativo** → busque `PETR` → selecione PETR4 → informe quantidade e valor investido.
4. Toque em **Cotações** para forçar sync.
5. Confira preço e valor de mercado no card.

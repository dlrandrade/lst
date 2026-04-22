# lst

Web app pessoal para rotina, saude e organizacao com os modulos:

- Dashboard
- Treinos
- Dieta
- Livros
- Filmes
- Hidratacao
- Compromissos
- Lembretes
- Remedios
- Exames

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase

## Estado atual

Ja existe no projeto:

- shell visual e navegacao principal
- camada de dados via Supabase JS
- consultas do dashboard e dos modulos
- server actions com escrita no Supabase
- autenticacao real via Supabase Auth
- clientes Supabase para browser e SSR

## Como rodar

1. Configure `.env.local` com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Rode os comandos:

```bash
npm install
npm run dev
```

## Supabase

O app ja esta preparado para usar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Arquivos principais da integracao:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/data.ts`
- `src/server/app-data.ts`
- `src/server/actions.ts`

Para o runtime publicado na Vercel, nao e mais necessario configurar `DATABASE_URL` nem `DIRECT_URL`.

Se precisar recriar estrutura, seed ou politicas direto no banco, os artefatos antigos continuam em:

- `prisma/schema.prisma`
- `prisma/seed.mjs`
- `supabase/rls.sql`

## Arquivos principais

- `docs/lst-technical-spec.md`
- `src/server/app-data.ts`
- `src/server/actions.ts`

## Proximos passos

- adicionar edicao inline dos registros
- criar logs de conclusao detalhados para treino, dieta e remedios
- anexos de exames
- busca global real

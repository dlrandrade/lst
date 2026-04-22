# lst — Meu App de Tudo

Life OS pessoal: tarefas do dia, treino, dieta e livros. Next.js 14 + Supabase + Tailwind.

## Setup

1. **Env** — copie `.env.example` para `.env.local` e preencha:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
2. **Schema do banco** — abra o SQL Editor do Supabase e rode
   [`supabase/schema.sql`](./supabase/schema.sql). Ele cria tabelas,
   políticas e já popula dados iniciais.
3. **Local**
   ```bash
   npm install
   npm run dev
   ```

## Deploy (Vercel)

Adicione as duas variáveis `NEXT_PUBLIC_SUPABASE_*` no projeto Vercel e faça deploy.

## Telas

- `/` — saudação, lista de tarefas do dia, cards (Treino, Mastria, Dieta), busca/adicionar
- `/treino` — rotina semanal com check por exercício
- `/dieta` — refeições do mês com check
- `/livros` — meta 2026 + toggle para lidos em 2025

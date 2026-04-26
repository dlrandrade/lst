# lst — Meu App de Tudo

Life OS pessoal: tarefas, treino, dieta, livros, água, compromissos, lembretes,
remédios, filmes, exames e um chat de AI. Next.js 14 + Supabase + Tailwind.

## Setup

1. **Env** — copie `.env.example` para `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ANTHROPIC_API_KEY=...
   ```

2. **Schema base** — abra o SQL Editor do Supabase e rode
   [`supabase/schema.sql`](./supabase/schema.sql).

3. **Subir o app, fazer login** — `npm install && npm run dev`, acesse
   `/login`, peça o magic link, entre. Isso cria seu usuário em `auth.users`.

4. **Migration de segurança** — agora rode no SQL Editor:
   - [`supabase/migrations/001_auth_and_user_scoping.sql`](./supabase/migrations/001_auth_and_user_scoping.sql)
     — adiciona `user_id` em todas as tabelas, faz backfill para o seu uid e
     troca a RLS `public all` por `auth.uid() = user_id`.
   - [`supabase/migrations/002_workout_full_week_seeds.sql`](./supabase/migrations/002_workout_full_week_seeds.sql)
     — popula exercícios para todos os dias da semana.

5. **Auth do Supabase** — no painel, em Authentication → Providers, ative
   Email (Magic Link). Em URL Configuration, adicione seu domínio
   (ex: `https://seu-app.vercel.app`) em Site URL e Redirect URLs.

## Deploy (Vercel)

Adicione `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e
`ANTHROPIC_API_KEY` no projeto e faça deploy.

## Telas

- `/` — saudação, tarefas do dia, cards dinâmicos (treino do dia, livro
  em leitura, refeição da hora atual)
- `/categorias` — grid com tudo
- `/ai` — chat com Claude Haiku 4.5
- `/treino`, `/dieta`, `/livros`, `/agua`, `/compromissos`, `/lembretes`,
  `/remedios`, `/filmes`, `/exames`
- `/login` — magic link

## Segurança

Single-user com Supabase Auth. RLS por `auth.uid() = user_id` em todas as
tabelas. Sem login, middleware redireciona para `/login`. Sem `ANTHROPIC_API_KEY`,
a rota `/api/ai` retorna 500 (o resto do app funciona).

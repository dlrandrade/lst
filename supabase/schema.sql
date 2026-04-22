-- lst schema
-- Paste into Supabase SQL editor and run.

create extension if not exists "pgcrypto";

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  done boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists workout_days (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null unique check (day_of_week between 0 and 6),
  label text not null
);

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references workout_days(id) on delete cascade,
  name text not null,
  done boolean not null default false,
  position int not null default 0
);

create table if not exists meals (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  month text not null default 'Abril',
  items text[] not null default '{}',
  done boolean not null default false,
  position int not null default 0
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  year int not null default 2026,
  read boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;
alter table workout_days enable row level security;
alter table workout_exercises enable row level security;
alter table meals enable row level security;
alter table books enable row level security;

-- Open policies (single-user app). Tighten later if needed.
do $$
declare t text;
begin
  for t in select unnest(array['tasks','workout_days','workout_exercises','meals','books']) loop
    execute format('drop policy if exists "public all" on %I;', t);
    execute format('create policy "public all" on %I for all using (true) with check (true);', t);
  end loop;
end$$;

-- Seed
insert into tasks (title, position) values
  ('Beber água', 1),
  ('Tomar creatina', 2),
  ('Pagar carro', 3),
  ('Ler Mastria', 4),
  ('Hoje é Leg Day', 5)
on conflict do nothing;

insert into workout_days (day_of_week, label) values
  (1, 'Segunda-feira'),(2, 'Terça-feira'),(3, 'Quarta-feira'),
  (4, 'Quinta-feira'),(5, 'Sexta-feira'),(6, 'Sábado'),(0, 'Domingo')
on conflict do nothing;

insert into workout_exercises (day_id, name, position)
select d.id, x.name, x.pos from workout_days d
cross join lateral (values
  ('Supino reto', 1),('Supino inclinado', 2),('Supino reclinado', 3),
  ('Voador', 4),('Tríceps máquina', 5),('Tríceps na polia', 6)
) as x(name, pos)
where d.day_of_week = 1
and not exists (select 1 from workout_exercises where day_id = d.id);

insert into meals (label, month, items, position) values
  ('Café da manhã', 'Abril',
   array['3 ovos','1 fatia de pão de caixa','1 fruta','Café sem açúcar','Iogurte natural com granola'], 1),
  ('Almoço', 'Abril',
   array['300g de proteína','300g de carboidrato','Refrigerante sem açúcar'], 2),
  ('Lanche', 'Abril',
   array['Iogurte natural com granola'], 3),
  ('Jantar', 'Abril',
   array['200g de proteína','Salada à vontade'], 4)
on conflict do nothing;

insert into books (title, author, year, read, position) values
  ('Maestria', 'Robert Greene', 2026, false, 1),
  ('Dom Quixote', 'Miguel de Cervantes', 2026, false, 2),
  ('1984', 'George Orwell', 2026, false, 3),
  ('O Pequeno Príncipe', 'Antoine de Saint-Exupéry', 2026, false, 4),
  ('Dom Casmurro', 'Machado de Assis', 2026, false, 5),
  ('Cem Anos de Solidão', 'Gabriel García Márquez', 2026, false, 6),
  ('Orgulho e Preconceito', 'Jane Austen', 2026, false, 7)
on conflict do nothing;

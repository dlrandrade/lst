-- 001_auth_and_user_scoping.sql
-- Adds user_id scoping and replaces "public all" RLS policies with auth.uid() checks.
-- Run AFTER you have signed up at least once via the app (so auth.users has your row),
-- then set the variable below to your user id and execute the whole script.

-- ============ STEP 1: pick your owner uid ============
-- Replace the value below with your own auth.users.id (visible in Supabase dashboard).
-- All existing seed rows will be reassigned to this uid.
do $$
declare
  owner_uid uuid := (select id from auth.users order by created_at limit 1);
begin
  if owner_uid is null then
    raise exception 'No user found in auth.users. Sign up via the app first, then re-run.';
  end if;

  -- ============ STEP 2: add user_id columns ============
  perform 1;
  execute 'alter table tasks               add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table workout_days        add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table workout_exercises   add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table meals               add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table books               add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table movies              add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table water_entries       add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table prefs               add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table appointments        add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table reminders           add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table medications         add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table med_logs            add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table exams               add column if not exists user_id uuid references auth.users(id) on delete cascade';
  execute 'alter table chat_messages       add column if not exists user_id uuid references auth.users(id) on delete cascade';

  -- ============ STEP 3: backfill existing rows to the owner ============
  execute format('update tasks             set user_id = %L where user_id is null', owner_uid);
  execute format('update workout_days      set user_id = %L where user_id is null', owner_uid);
  execute format('update workout_exercises set user_id = %L where user_id is null', owner_uid);
  execute format('update meals             set user_id = %L where user_id is null', owner_uid);
  execute format('update books             set user_id = %L where user_id is null', owner_uid);
  execute format('update movies            set user_id = %L where user_id is null', owner_uid);
  execute format('update water_entries     set user_id = %L where user_id is null', owner_uid);
  execute format('update prefs             set user_id = %L where user_id is null', owner_uid);
  execute format('update appointments      set user_id = %L where user_id is null', owner_uid);
  execute format('update reminders         set user_id = %L where user_id is null', owner_uid);
  execute format('update medications       set user_id = %L where user_id is null', owner_uid);
  execute format('update med_logs          set user_id = %L where user_id is null', owner_uid);
  execute format('update exams             set user_id = %L where user_id is null', owner_uid);
  execute format('update chat_messages     set user_id = %L where user_id is null', owner_uid);
end$$;

-- ============ STEP 4: enforce NOT NULL + default auth.uid() ============
alter table tasks               alter column user_id set not null, alter column user_id set default auth.uid();
alter table workout_days        alter column user_id set not null, alter column user_id set default auth.uid();
alter table workout_exercises   alter column user_id set not null, alter column user_id set default auth.uid();
alter table meals               alter column user_id set not null, alter column user_id set default auth.uid();
alter table books               alter column user_id set not null, alter column user_id set default auth.uid();
alter table movies              alter column user_id set not null, alter column user_id set default auth.uid();
alter table water_entries       alter column user_id set not null, alter column user_id set default auth.uid();
alter table prefs               alter column user_id set not null, alter column user_id set default auth.uid();
alter table appointments        alter column user_id set not null, alter column user_id set default auth.uid();
alter table reminders           alter column user_id set not null, alter column user_id set default auth.uid();
alter table medications         alter column user_id set not null, alter column user_id set default auth.uid();
alter table med_logs            alter column user_id set not null, alter column user_id set default auth.uid();
alter table exams               alter column user_id set not null, alter column user_id set default auth.uid();
alter table chat_messages       alter column user_id set not null, alter column user_id set default auth.uid();

-- prefs uses (id=1) singleton — relax it to one per user:
alter table prefs drop constraint if exists prefs_pkey;
alter table prefs drop constraint if exists prefs_id_check;
alter table prefs add primary key (user_id);
alter table prefs drop column id;

-- ============ STEP 5: replace "public all" with per-user policies ============
do $$
declare t text;
begin
  for t in select unnest(array[
    'tasks','workout_days','workout_exercises','meals','books',
    'movies','water_entries','prefs','appointments','reminders',
    'medications','med_logs','exams','chat_messages'
  ]) loop
    execute format('drop policy if exists "public all" on %I;', t);
    execute format('drop policy if exists "owner all" on %I;', t);
    execute format(
      'create policy "owner all" on %I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());',
      t
    );
  end loop;
end$$;

-- ============ STEP 6: drop the month default in meals (now driven client-side) ============
alter table meals alter column month drop not null;
alter table meals alter column month drop default;

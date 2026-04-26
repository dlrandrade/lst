-- 002_workout_full_week_seeds.sql
-- Seeds exercises for every weekday for the first user.
-- Idempotent: only inserts if a day has no exercises yet.

do $$
declare
  owner_uid uuid := (select id from auth.users order by created_at limit 1);
  d record;
begin
  if owner_uid is null then return; end if;

  -- Make sure all 7 days exist for the user
  insert into workout_days (day_of_week, label, user_id)
  values
    (1, 'Segunda-feira', owner_uid),
    (2, 'Terça-feira',   owner_uid),
    (3, 'Quarta-feira',  owner_uid),
    (4, 'Quinta-feira',  owner_uid),
    (5, 'Sexta-feira',   owner_uid),
    (6, 'Sábado',        owner_uid),
    (0, 'Domingo',       owner_uid)
  on conflict (day_of_week) do nothing;

  for d in select id, day_of_week from workout_days where user_id = owner_uid loop
    if exists (select 1 from workout_exercises where day_id = d.id) then continue; end if;

    if d.day_of_week = 1 then       -- Peito + Tríceps
      insert into workout_exercises (day_id, name, position, user_id) values
        (d.id, 'Supino reto', 1, owner_uid),
        (d.id, 'Supino inclinado', 2, owner_uid),
        (d.id, 'Voador', 3, owner_uid),
        (d.id, 'Tríceps na polia', 4, owner_uid),
        (d.id, 'Tríceps testa', 5, owner_uid);
    elsif d.day_of_week = 2 then    -- Costas + Bíceps
      insert into workout_exercises (day_id, name, position, user_id) values
        (d.id, 'Puxada frontal', 1, owner_uid),
        (d.id, 'Remada curvada', 2, owner_uid),
        (d.id, 'Remada baixa', 3, owner_uid),
        (d.id, 'Rosca direta', 4, owner_uid),
        (d.id, 'Rosca martelo', 5, owner_uid);
    elsif d.day_of_week = 3 then    -- Pernas
      insert into workout_exercises (day_id, name, position, user_id) values
        (d.id, 'Agachamento livre', 1, owner_uid),
        (d.id, 'Leg press', 2, owner_uid),
        (d.id, 'Cadeira extensora', 3, owner_uid),
        (d.id, 'Mesa flexora', 4, owner_uid),
        (d.id, 'Panturrilha em pé', 5, owner_uid);
    elsif d.day_of_week = 4 then    -- Ombro + Trapézio
      insert into workout_exercises (day_id, name, position, user_id) values
        (d.id, 'Desenvolvimento militar', 1, owner_uid),
        (d.id, 'Elevação lateral', 2, owner_uid),
        (d.id, 'Elevação frontal', 3, owner_uid),
        (d.id, 'Encolhimento', 4, owner_uid);
    elsif d.day_of_week = 5 then    -- Full upper
      insert into workout_exercises (day_id, name, position, user_id) values
        (d.id, 'Supino reclinado', 1, owner_uid),
        (d.id, 'Barra fixa', 2, owner_uid),
        (d.id, 'Tríceps máquina', 3, owner_uid),
        (d.id, 'Rosca alternada', 4, owner_uid);
    elsif d.day_of_week = 6 then    -- Cardio + Core
      insert into workout_exercises (day_id, name, position, user_id) values
        (d.id, 'Esteira 30min', 1, owner_uid),
        (d.id, 'Abdominal infra', 2, owner_uid),
        (d.id, 'Prancha 1min x3', 3, owner_uid);
    end if;
    -- Sunday: rest day, no exercises.
  end loop;
end$$;

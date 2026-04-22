grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

alter table public."User" enable row level security;
alter table public."Profile" enable row level security;
alter table public."WaterGoal" enable row level security;
alter table public."Task" enable row level security;
alter table public."TaskLog" enable row level security;
alter table public."WorkoutPlan" enable row level security;
alter table public."WorkoutDay" enable row level security;
alter table public."WorkoutExercise" enable row level security;
alter table public."WorkoutLog" enable row level security;
alter table public."MealPlan" enable row level security;
alter table public."MealSection" enable row level security;
alter table public."MealItem" enable row level security;
alter table public."MealLog" enable row level security;
alter table public."Book" enable row level security;
alter table public."BookLog" enable row level security;
alter table public."Movie" enable row level security;
alter table public."MovieLog" enable row level security;
alter table public."WaterLog" enable row level security;
alter table public."Appointment" enable row level security;
alter table public."Reminder" enable row level security;
alter table public."Medication" enable row level security;
alter table public."MedicationSchedule" enable row level security;
alter table public."MedicationLog" enable row level security;
alter table public."Exam" enable row level security;
alter table public."ExamLog" enable row level security;
alter table public."ExamFile" enable row level security;

drop policy if exists "user_self_access" on public."User";
create policy "user_self_access"
on public."User"
for all
to authenticated
using (id = auth.uid()::text)
with check (id = auth.uid()::text);

drop policy if exists "profile_self_access" on public."Profile";
create policy "profile_self_access"
on public."Profile"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "water_goal_self_access" on public."WaterGoal";
create policy "water_goal_self_access"
on public."WaterGoal"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "task_self_access" on public."Task";
create policy "task_self_access"
on public."Task"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "task_log_self_access" on public."TaskLog";
create policy "task_log_self_access"
on public."TaskLog"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "workout_plan_self_access" on public."WorkoutPlan";
create policy "workout_plan_self_access"
on public."WorkoutPlan"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "workout_day_owner_access" on public."WorkoutDay";
create policy "workout_day_owner_access"
on public."WorkoutDay"
for all
to authenticated
using (
  exists (
    select 1
    from public."WorkoutPlan" p
    where p.id = "WorkoutDay"."workoutPlanId"
      and p."userId" = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public."WorkoutPlan" p
    where p.id = "WorkoutDay"."workoutPlanId"
      and p."userId" = auth.uid()::text
  )
);

drop policy if exists "workout_exercise_owner_access" on public."WorkoutExercise";
create policy "workout_exercise_owner_access"
on public."WorkoutExercise"
for all
to authenticated
using (
  exists (
    select 1
    from public."WorkoutDay" d
    join public."WorkoutPlan" p on p.id = d."workoutPlanId"
    where d.id = "WorkoutExercise"."workoutDayId"
      and p."userId" = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public."WorkoutDay" d
    join public."WorkoutPlan" p on p.id = d."workoutPlanId"
    where d.id = "WorkoutExercise"."workoutDayId"
      and p."userId" = auth.uid()::text
  )
);

drop policy if exists "workout_log_self_access" on public."WorkoutLog";
create policy "workout_log_self_access"
on public."WorkoutLog"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "meal_plan_self_access" on public."MealPlan";
create policy "meal_plan_self_access"
on public."MealPlan"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "meal_section_owner_access" on public."MealSection";
create policy "meal_section_owner_access"
on public."MealSection"
for all
to authenticated
using (
  exists (
    select 1
    from public."MealPlan" p
    where p.id = "MealSection"."mealPlanId"
      and p."userId" = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public."MealPlan" p
    where p.id = "MealSection"."mealPlanId"
      and p."userId" = auth.uid()::text
  )
);

drop policy if exists "meal_item_owner_access" on public."MealItem";
create policy "meal_item_owner_access"
on public."MealItem"
for all
to authenticated
using (
  exists (
    select 1
    from public."MealSection" s
    join public."MealPlan" p on p.id = s."mealPlanId"
    where s.id = "MealItem"."mealSectionId"
      and p."userId" = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public."MealSection" s
    join public."MealPlan" p on p.id = s."mealPlanId"
    where s.id = "MealItem"."mealSectionId"
      and p."userId" = auth.uid()::text
  )
);

drop policy if exists "meal_log_self_access" on public."MealLog";
create policy "meal_log_self_access"
on public."MealLog"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "book_self_access" on public."Book";
create policy "book_self_access"
on public."Book"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "book_log_self_access" on public."BookLog";
create policy "book_log_self_access"
on public."BookLog"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "movie_self_access" on public."Movie";
create policy "movie_self_access"
on public."Movie"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "movie_log_self_access" on public."MovieLog";
create policy "movie_log_self_access"
on public."MovieLog"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "water_log_self_access" on public."WaterLog";
create policy "water_log_self_access"
on public."WaterLog"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "appointment_self_access" on public."Appointment";
create policy "appointment_self_access"
on public."Appointment"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "reminder_self_access" on public."Reminder";
create policy "reminder_self_access"
on public."Reminder"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "medication_self_access" on public."Medication";
create policy "medication_self_access"
on public."Medication"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "medication_schedule_owner_access" on public."MedicationSchedule";
create policy "medication_schedule_owner_access"
on public."MedicationSchedule"
for all
to authenticated
using (
  exists (
    select 1
    from public."Medication" m
    where m.id = "MedicationSchedule"."medicationId"
      and m."userId" = auth.uid()::text
  )
)
with check (
  exists (
    select 1
    from public."Medication" m
    where m.id = "MedicationSchedule"."medicationId"
      and m."userId" = auth.uid()::text
  )
);

drop policy if exists "medication_log_self_access" on public."MedicationLog";
create policy "medication_log_self_access"
on public."MedicationLog"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "exam_self_access" on public."Exam";
create policy "exam_self_access"
on public."Exam"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "exam_log_self_access" on public."ExamLog";
create policy "exam_log_self_access"
on public."ExamLog"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

drop policy if exists "exam_file_self_access" on public."ExamFile";
create policy "exam_file_self_access"
on public."ExamFile"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

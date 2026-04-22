"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  type AppointmentRow,
  type BookRow,
  type MealItemRow,
  type MealSectionRow,
  type MovieRow,
  type ReminderRow,
  type TaskLogRow,
  type TaskRow,
  type WaterLogRow,
  type WorkoutDayRow,
  type WorkoutExerciseRow,
  getDataClient,
  getOwnedRow,
  requireValue,
  unwrapData,
} from "@/lib/supabase/data";
import { getCurrentUserContext } from "@/server/app-data";

const nonEmptyText = z.string().trim().min(1);
const optionalText = z.string().trim().optional();

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readId(formData: FormData, key: string) {
  return nonEmptyText.parse(readText(formData, key));
}

async function ensureTaskOwner(taskId: string, userId: string) {
  await getOwnedRow<TaskRow>("Task", taskId, userId);
}

async function ensureWaterLogOwner(logId: string, userId: string) {
  await getOwnedRow<WaterLogRow>("WaterLog", logId, userId);
}

async function ensureAppointmentOwner(appointmentId: string, userId: string) {
  await getOwnedRow<AppointmentRow>("Appointment", appointmentId, userId);
}

async function ensureReminderOwner(reminderId: string, userId: string) {
  await getOwnedRow<ReminderRow>("Reminder", reminderId, userId);
}

async function ensureBookOwner(bookId: string, userId: string) {
  await getOwnedRow<BookRow>("Book", bookId, userId);
}

async function ensureMovieOwner(movieId: string, userId: string) {
  await getOwnedRow<MovieRow>("Movie", movieId, userId);
}

async function ensureWorkoutPlanOwner(planId: string, userId: string) {
  await getOwnedRow("WorkoutPlan", planId, userId);
}

async function ensureWorkoutDayOwner(dayId: string, userId: string) {
  const supabase = await getDataClient();
  const day = requireValue(
    (unwrapData(
      await supabase.from("WorkoutDay").select("*").eq("id", dayId).maybeSingle(),
      "Workout day lookup failed",
    ) ?? null) as WorkoutDayRow | null,
    "Workout day not found",
  );

  await ensureWorkoutPlanOwner(day.workoutPlanId, userId);
  return day;
}

async function ensureWorkoutExerciseOwner(exerciseId: string, userId: string) {
  const supabase = await getDataClient();
  const exercise = requireValue(
    (unwrapData(
      await supabase.from("WorkoutExercise").select("*").eq("id", exerciseId).maybeSingle(),
      "Workout exercise lookup failed",
    ) ?? null) as WorkoutExerciseRow | null,
    "Workout exercise not found",
  );

  await ensureWorkoutDayOwner(exercise.workoutDayId, userId);
  return exercise;
}

async function ensureMealPlanOwner(planId: string, userId: string) {
  await getOwnedRow("MealPlan", planId, userId);
}

async function ensureMealSectionOwner(sectionId: string, userId: string) {
  const supabase = await getDataClient();
  const section = requireValue(
    (unwrapData(
      await supabase.from("MealSection").select("*").eq("id", sectionId).maybeSingle(),
      "Meal section lookup failed",
    ) ?? null) as MealSectionRow | null,
    "Meal section not found",
  );

  await ensureMealPlanOwner(section.mealPlanId, userId);
  return section;
}

async function ensureMealItemOwner(itemId: string, userId: string) {
  const supabase = await getDataClient();
  const item = requireValue(
    (unwrapData(
      await supabase.from("MealItem").select("*").eq("id", itemId).maybeSingle(),
      "Meal item lookup failed",
    ) ?? null) as MealItemRow | null,
    "Meal item not found",
  );

  await ensureMealSectionOwner(item.mealSectionId, userId);
  return item;
}

export async function createTask(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Task").insert({
      userId,
      title,
      isRecurring: true,
    }),
    "Failed to create task",
  );

  revalidatePath("/dashboard");
}

export async function toggleTaskForToday(formData: FormData) {
  const taskId = readId(formData, "taskId");
  const { userId } = await getCurrentUserContext();
  await ensureTaskOwner(taskId, userId);
  const supabase = await getDataClient();
  const occurredOn = new Date();
  occurredOn.setHours(0, 0, 0, 0);
  const occurredOnIso = occurredOn.toISOString();

  const existing = (unwrapData(
    await supabase
      .from("TaskLog")
      .select("*")
      .eq("taskId", taskId)
      .eq("occurredOn", occurredOnIso)
      .maybeSingle(),
    "Failed to load task log",
  ) ?? null) as TaskLogRow | null;

  if (existing) {
    unwrapData(
      await supabase.from("TaskLog").delete().eq("id", existing.id),
      "Failed to delete task log",
    );
  } else {
    unwrapData(
      await supabase.from("TaskLog").insert({
        userId,
        taskId,
        occurredOn: occurredOnIso,
        completed: true,
      }),
      "Failed to create task log",
    );
  }

  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const taskId = readId(formData, "taskId");
  const { userId } = await getCurrentUserContext();
  await ensureTaskOwner(taskId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("Task").delete().eq("id", taskId), "Failed to delete task");
  revalidatePath("/dashboard");
}

export async function addWaterLog(formData: FormData) {
  const amountMl = z.coerce.number().int().positive().parse(readText(formData, "amountMl"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("WaterLog").insert({
      userId,
      amountMl,
      occurredAt: new Date().toISOString(),
    }),
    "Failed to create water log",
  );

  revalidatePath("/dashboard");
  revalidatePath("/hidratacao");
}

export async function deleteWaterLog(formData: FormData) {
  const logId = readId(formData, "logId");
  const { userId } = await getCurrentUserContext();
  await ensureWaterLogOwner(logId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("WaterLog").delete().eq("id", logId), "Failed to delete water log");

  revalidatePath("/dashboard");
  revalidatePath("/hidratacao");
}

export async function createAppointment(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const startsAt = z.coerce.date().parse(readText(formData, "startsAt"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Appointment").insert({
      userId,
      title,
      startsAt: startsAt.toISOString(),
    }),
    "Failed to create appointment",
  );

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

export async function updateAppointmentStatus(formData: FormData) {
  const appointmentId = readId(formData, "appointmentId");
  const status = z.enum(["SCHEDULED", "DONE", "CANCELED"]).parse(readText(formData, "status"));
  const { userId } = await getCurrentUserContext();
  await ensureAppointmentOwner(appointmentId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Appointment").update({ status }).eq("id", appointmentId),
    "Failed to update appointment",
  );

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

export async function deleteAppointment(formData: FormData) {
  const appointmentId = readId(formData, "appointmentId");
  const { userId } = await getCurrentUserContext();
  await ensureAppointmentOwner(appointmentId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Appointment").delete().eq("id", appointmentId),
    "Failed to delete appointment",
  );

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

export async function createReminder(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Reminder").insert({
      userId,
      title,
    }),
    "Failed to create reminder",
  );

  revalidatePath("/lembretes");
}

export async function updateReminderStatus(formData: FormData) {
  const reminderId = readId(formData, "reminderId");
  const status = z.enum(["PENDING", "DONE", "CANCELED"]).parse(readText(formData, "status"));
  const { userId } = await getCurrentUserContext();
  await ensureReminderOwner(reminderId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Reminder").update({ status }).eq("id", reminderId),
    "Failed to update reminder",
  );

  revalidatePath("/lembretes");
}

export async function deleteReminder(formData: FormData) {
  const reminderId = readId(formData, "reminderId");
  const { userId } = await getCurrentUserContext();
  await ensureReminderOwner(reminderId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("Reminder").delete().eq("id", reminderId), "Failed to delete reminder");
  revalidatePath("/lembretes");
}

export async function createBook(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const author = optionalText.parse(readText(formData, "author"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Book").insert({
      userId,
      title,
      author: author || null,
    }),
    "Failed to create book",
  );

  revalidatePath("/livros");
}

export async function updateBookStatus(formData: FormData) {
  const bookId = readId(formData, "bookId");
  const status = z.enum(["TO_READ", "READING", "FINISHED", "ABANDONED"]).parse(
    readText(formData, "status"),
  );
  const { userId } = await getCurrentUserContext();
  await ensureBookOwner(bookId, userId);
  const supabase = await getDataClient();

  const updateData: Record<string, string | null> = { status };
  if (status === "READING") {
    updateData.startedAt = new Date().toISOString();
    updateData.finishedAt = null;
  }
  if (status === "FINISHED") {
    updateData.finishedAt = new Date().toISOString();
  }

  unwrapData(await supabase.from("Book").update(updateData).eq("id", bookId), "Failed to update book");
  unwrapData(
    await supabase.from("BookLog").insert({
      userId,
      bookId,
      status,
    }),
    "Failed to create book log",
  );

  revalidatePath("/dashboard");
  revalidatePath("/livros");
}

export async function deleteBook(formData: FormData) {
  const bookId = readId(formData, "bookId");
  const { userId } = await getCurrentUserContext();
  await ensureBookOwner(bookId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("Book").delete().eq("id", bookId), "Failed to delete book");
  revalidatePath("/dashboard");
  revalidatePath("/livros");
}

export async function createMovie(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const genre = optionalText.parse(readText(formData, "genre"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Movie").insert({
      userId,
      title,
      genre: genre || null,
    }),
    "Failed to create movie",
  );

  revalidatePath("/filmes");
}

export async function updateMovieStatus(formData: FormData) {
  const movieId = readId(formData, "movieId");
  const status = z.enum(["TO_WATCH", "WATCHING", "WATCHED", "ABANDONED"]).parse(
    readText(formData, "status"),
  );
  const { userId } = await getCurrentUserContext();
  await ensureMovieOwner(movieId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase
      .from("Movie")
      .update({
        status,
        watchedAt: status === "WATCHED" ? new Date().toISOString() : null,
      })
      .eq("id", movieId),
    "Failed to update movie",
  );

  unwrapData(
    await supabase.from("MovieLog").insert({
      userId,
      movieId,
      status,
    }),
    "Failed to create movie log",
  );

  revalidatePath("/filmes");
}

export async function deleteMovie(formData: FormData) {
  const movieId = readId(formData, "movieId");
  const { userId } = await getCurrentUserContext();
  await ensureMovieOwner(movieId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("Movie").delete().eq("id", movieId), "Failed to delete movie");
  revalidatePath("/filmes");
}

export async function createWorkoutPlan(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("WorkoutPlan").insert({
      userId,
      name,
      isActive: true,
    }),
    "Failed to create workout plan",
  );

  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function deleteWorkoutPlan(formData: FormData) {
  const planId = readId(formData, "planId");
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutPlanOwner(planId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("WorkoutPlan").delete().eq("id", planId), "Failed to delete workout plan");

  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function createWorkoutDay(formData: FormData) {
  const planId = readId(formData, "planId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const weekDay = z.coerce.number().int().min(0).max(6).parse(readText(formData, "weekDay"));
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutPlanOwner(planId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("WorkoutDay").insert({
      workoutPlanId: planId,
      title,
      weekDay,
    }),
    "Failed to create workout day",
  );

  revalidatePath("/treinos");
}

export async function deleteWorkoutDay(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutDayOwner(dayId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("WorkoutDay").delete().eq("id", dayId), "Failed to delete workout day");
  revalidatePath("/treinos");
}

export async function createWorkoutExercise(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutDayOwner(dayId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("WorkoutExercise").insert({
      workoutDayId: dayId,
      name,
    }),
    "Failed to create workout exercise",
  );

  revalidatePath("/treinos");
}

export async function deleteWorkoutExercise(formData: FormData) {
  const exerciseId = readId(formData, "exerciseId");
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutExerciseOwner(exerciseId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("WorkoutExercise").delete().eq("id", exerciseId),
    "Failed to delete workout exercise",
  );
  revalidatePath("/treinos");
}

export async function createMealPlan(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("MealPlan").insert({
      userId,
      name,
      isActive: true,
    }),
    "Failed to create meal plan",
  );

  revalidatePath("/dieta");
  revalidatePath("/dashboard");
}

export async function deleteMealPlan(formData: FormData) {
  const planId = readId(formData, "planId");
  const { userId } = await getCurrentUserContext();
  await ensureMealPlanOwner(planId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("MealPlan").delete().eq("id", planId), "Failed to delete meal plan");

  revalidatePath("/dieta");
  revalidatePath("/dashboard");
}

export async function createMealSection(formData: FormData) {
  const planId = readId(formData, "planId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { userId } = await getCurrentUserContext();
  await ensureMealPlanOwner(planId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("MealSection").insert({
      mealPlanId: planId,
      title,
    }),
    "Failed to create meal section",
  );

  revalidatePath("/dieta");
}

export async function deleteMealSection(formData: FormData) {
  const sectionId = readId(formData, "sectionId");
  const { userId } = await getCurrentUserContext();
  await ensureMealSectionOwner(sectionId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("MealSection").delete().eq("id", sectionId),
    "Failed to delete meal section",
  );
  revalidatePath("/dieta");
}

export async function createMealItem(formData: FormData) {
  const sectionId = readId(formData, "sectionId");
  const description = nonEmptyText.parse(readText(formData, "description"));
  const { userId } = await getCurrentUserContext();
  await ensureMealSectionOwner(sectionId, userId);
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("MealItem").insert({
      mealSectionId: sectionId,
      description,
    }),
    "Failed to create meal item",
  );

  revalidatePath("/dieta");
}

export async function deleteMealItem(formData: FormData) {
  const itemId = readId(formData, "itemId");
  const { userId } = await getCurrentUserContext();
  await ensureMealItemOwner(itemId, userId);
  const supabase = await getDataClient();

  unwrapData(await supabase.from("MealItem").delete().eq("id", itemId), "Failed to delete meal item");
  revalidatePath("/dieta");
}

export async function createMedication(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Medication").insert({
      userId,
      name,
      frequencyType: "DAILY",
    }),
    "Failed to create medication",
  );

  revalidatePath("/remedios");
}

export async function createExam(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("Exam").insert({
      userId,
      name,
      currentStatus: "PLANNED",
    }),
    "Failed to create exam",
  );

  revalidatePath("/exames");
}

import type { PostgrestError, PostgrestSingleResponse } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export type TableName =
  | "User"
  | "Profile"
  | "WaterGoal"
  | "Task"
  | "TaskLog"
  | "WorkoutPlan"
  | "WorkoutDay"
  | "WorkoutExercise"
  | "WorkoutLog"
  | "MealPlan"
  | "MealSection"
  | "MealItem"
  | "MealLog"
  | "Book"
  | "BookLog"
  | "Movie"
  | "MovieLog"
  | "WaterLog"
  | "Appointment"
  | "Reminder"
  | "Medication"
  | "MedicationSchedule"
  | "MedicationLog"
  | "Exam"
  | "ExamLog"
  | "ExamFile";

export type UserRow = {
  id: string;
  email: string;
};

export type ProfileRow = {
  id: string;
  userId: string;
  fullName: string;
  timezone: string;
  dailyWaterGoal: number | null;
};

export type WaterGoalRow = {
  id: string;
  userId: string;
  dailyGoalMl: number;
};

export type TaskRow = {
  id: string;
  userId: string;
  title: string;
  status: string;
  sortOrder: number;
  createdAt: string;
};

export type TaskLogRow = {
  id: string;
  userId: string;
  taskId: string;
  occurredOn: string;
  completed: boolean;
};

export type WorkoutPlanRow = {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
};

export type WorkoutDayRow = {
  id: string;
  workoutPlanId: string;
  weekDay: number;
  title: string | null;
  sortOrder: number;
};

export type WorkoutExerciseRow = {
  id: string;
  workoutDayId: string;
  name: string;
  notes: string | null;
  sortOrder: number;
};

export type MealPlanRow = {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
};

export type MealSectionRow = {
  id: string;
  mealPlanId: string;
  title: string;
  sortOrder: number;
};

export type MealItemRow = {
  id: string;
  mealSectionId: string;
  description: string;
  sortOrder: number;
};

export type BookRow = {
  id: string;
  userId: string;
  title: string;
  author: string | null;
  status: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type MovieRow = {
  id: string;
  userId: string;
  title: string;
  genre: string | null;
  status: string;
  updatedAt: string;
  watchedAt: string | null;
};

export type WaterLogRow = {
  id: string;
  userId: string;
  amountMl: number;
  occurredAt: string;
};

export type AppointmentRow = {
  id: string;
  userId: string;
  title: string;
  startsAt: string;
  status: string;
};

export type ReminderRow = {
  id: string;
  userId: string;
  title: string;
  priority: string;
  dueAt: string | null;
  status: string;
};

export type MedicationRow = {
  id: string;
  userId: string;
  name: string;
  frequencyType: string;
  isActive: boolean;
  createdAt: string;
};

export type MedicationScheduleRow = {
  id: string;
  medicationId: string;
};

export type ExamRow = {
  id: string;
  userId: string;
  name: string;
  currentStatus: string;
  category: string | null;
  updatedAt: string;
};

function describeError(error: PostgrestError | null, context: string) {
  if (!error) {
    return;
  }

  throw new Error(`${context}: ${error.message}`);
}

export async function getDataClient() {
  return createClient();
}

export function unwrapData<T>(result: PostgrestSingleResponse<T>, context: string) {
  describeError(result.error, context);
  return result.data;
}

export function requireValue<T>(value: T | null, context: string) {
  if (value === null) {
    throw new Error(context);
  }

  return value;
}

export async function getOwnedRow<T extends { id: string; userId: string }>(
  table: TableName,
  id: string,
  userId: string,
) {
  const supabase = await getDataClient();
  const row = unwrapData(
    await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .eq("userId", userId)
      .maybeSingle<T>(),
    `${table} lookup failed`,
  );

  return requireValue(row, `${table} not found`);
}

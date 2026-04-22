import { startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import {
  type AppointmentRow,
  type BookRow,
  type ExamRow,
  type MealItemRow,
  type MealPlanRow,
  type MealSectionRow,
  type MedicationRow,
  type MedicationScheduleRow,
  type MovieRow,
  type ProfileRow,
  type ReminderRow,
  type TaskLogRow,
  type TaskRow,
  type UserRow,
  type WaterGoalRow,
  type WaterLogRow,
  type WorkoutDayRow,
  type WorkoutExerciseRow,
  type WorkoutPlanRow,
  getDataClient,
  requireValue,
  unwrapData,
} from "@/lib/supabase/data";

function inferName(email: string, fullName?: string | null) {
  if (fullName?.trim()) {
    return fullName.trim();
  }

  return email.split("@")[0] || "Usuario";
}

async function ensureBaseRecords(userId: string, email: string, fullName?: string | null) {
  const supabase = await getDataClient();

  unwrapData(
    await supabase.from("User").upsert(
      {
        id: userId,
        email,
      },
      { onConflict: "id" },
    ),
    "Failed to sync user",
  );

  unwrapData(
    await supabase.from("Profile").upsert(
      {
        userId,
        fullName: inferName(email, fullName),
        timezone: "America/Recife",
        dailyWaterGoal: 2500,
      },
      { onConflict: "userId" },
    ),
    "Failed to sync profile",
  );

  unwrapData(
    await supabase.from("WaterGoal").upsert(
      {
        userId,
        dailyGoalMl: 2500,
      },
      { onConflict: "userId" },
    ),
    "Failed to sync water goal",
  );
}

export async function getCurrentUserContext() {
  const supabase = await getDataClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    redirect("/login");
  }

  const userId = authUser.id;
  const fullName =
    typeof authUser.user_metadata?.full_name === "string"
      ? authUser.user_metadata.full_name
      : null;

  await ensureBaseRecords(userId, authUser.email, fullName);

  const user = requireValue(
    unwrapData(
      await supabase.from("User").select("*").eq("id", userId).maybeSingle(),
      "Failed to load user",
    ) as UserRow | null,
    "User not found",
  );

  const profile = (unwrapData(
    await supabase.from("Profile").select("*").eq("userId", userId).maybeSingle(),
    "Failed to load profile",
  ) ?? null) as ProfileRow | null;

  const waterGoal = (unwrapData(
    await supabase.from("WaterGoal").select("*").eq("userId", userId).maybeSingle(),
    "Failed to load water goal",
  ) ?? null) as WaterGoalRow | null;

  return { userId, user: { ...user, profile, waterGoal } };
}

async function getActiveWorkoutPlan(userId: string) {
  const supabase = await getDataClient();
  const plan = (unwrapData(
    await supabase
      .from("WorkoutPlan")
      .select("*")
      .eq("userId", userId)
      .eq("isActive", true)
      .limit(1)
      .maybeSingle(),
    "Failed to load workout plan",
  ) ?? null) as WorkoutPlanRow | null;

  if (!plan) {
    return null;
  }

  const days = (unwrapData(
    await supabase
      .from("WorkoutDay")
      .select("*")
      .eq("workoutPlanId", plan.id)
      .order("weekDay", { ascending: true })
      .order("sortOrder", { ascending: true }),
    "Failed to load workout days",
  ) ?? []) as WorkoutDayRow[];

  const dayIds = days.map((day) => day.id);
  const exercises =
    dayIds.length > 0
      ? ((unwrapData(
          await supabase
            .from("WorkoutExercise")
            .select("*")
            .in("workoutDayId", dayIds)
            .order("sortOrder", { ascending: true }),
          "Failed to load workout exercises",
        ) ?? []) as WorkoutExerciseRow[])
      : [];

  return {
    ...plan,
    days: days.map((day) => ({
      ...day,
      exercises: exercises.filter((exercise) => exercise.workoutDayId === day.id),
    })),
  };
}

async function getActiveMealPlan(userId: string) {
  const supabase = await getDataClient();
  const plan = (unwrapData(
    await supabase
      .from("MealPlan")
      .select("*")
      .eq("userId", userId)
      .eq("isActive", true)
      .limit(1)
      .maybeSingle(),
    "Failed to load meal plan",
  ) ?? null) as MealPlanRow | null;

  if (!plan) {
    return null;
  }

  const sections = (unwrapData(
    await supabase
      .from("MealSection")
      .select("*")
      .eq("mealPlanId", plan.id)
      .order("sortOrder", { ascending: true }),
    "Failed to load meal sections",
  ) ?? []) as MealSectionRow[];

  const sectionIds = sections.map((section) => section.id);
  const items =
    sectionIds.length > 0
      ? ((unwrapData(
          await supabase
            .from("MealItem")
            .select("*")
            .in("mealSectionId", sectionIds)
            .order("sortOrder", { ascending: true }),
          "Failed to load meal items",
        ) ?? []) as MealItemRow[])
      : [];

  return {
    ...plan,
    sections: sections.map((section) => ({
      ...section,
      items: items.filter((item) => item.mealSectionId === section.id),
    })),
  };
}

export async function getDashboardData() {
  const { userId, user } = await getCurrentUserContext();
  const supabase = await getDataClient();
  const today = startOfDay(new Date());
  const todayIso = today.toISOString();

  const [
    tasksResult,
    taskLogsResult,
    waterLogsResult,
    workoutPlan,
    mealPlan,
    currentBookResult,
    appointmentsResult,
  ] = await Promise.all([
    supabase
      .from("Task")
      .select("*")
      .eq("userId", userId)
      .eq("status", "ACTIVE")
      .order("sortOrder", { ascending: true })
      .order("createdAt", { ascending: true })
      .limit(6),
    supabase.from("TaskLog").select("*").eq("userId", userId).eq("occurredOn", todayIso),
    supabase.from("WaterLog").select("*").eq("userId", userId).gte("occurredAt", todayIso),
    getActiveWorkoutPlan(userId),
    getActiveMealPlan(userId),
    supabase
      .from("Book")
      .select("*")
      .eq("userId", userId)
      .eq("status", "READING")
      .order("updatedAt", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("Appointment")
      .select("*")
      .eq("userId", userId)
      .gte("startsAt", todayIso)
      .order("startsAt", { ascending: true })
      .limit(3),
  ]);

  const tasks = (unwrapData(tasksResult, "Failed to load tasks") ?? []) as TaskRow[];
  const taskLogs = (unwrapData(taskLogsResult, "Failed to load task logs") ?? []) as TaskLogRow[];
  const waterLogs = (unwrapData(waterLogsResult, "Failed to load water logs") ?? []) as WaterLogRow[];
  const currentBook = (unwrapData(currentBookResult, "Failed to load current book") ?? null) as BookRow | null;
  const appointments = (unwrapData(
    appointmentsResult,
    "Failed to load appointments",
  ) ?? []) as AppointmentRow[];

  const completedTaskIds = new Set(
    taskLogs.filter((item) => item.completed).map((item) => item.taskId),
  );
  const waterConsumed = waterLogs.reduce((sum, entry) => sum + entry.amountMl, 0);
  const todaysWorkout = workoutPlan?.days.find((day) => day.weekDay === new Date().getDay()) ?? null;

  return {
    userName: user.profile?.fullName ?? "Daniel",
    dateLabel: today,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      completed: completedTaskIds.has(task.id),
    })),
    highlights: [
      {
        title: "Treino de hoje",
        value: todaysWorkout?.exercises.length
          ? `${todaysWorkout.exercises.length} exercicios`
          : "Sem treino hoje",
        meta: workoutPlan?.name ?? "Nenhum plano ativo",
      },
      {
        title: "Dieta ativa",
        value: `${mealPlan?.sections.length ?? 0} refeicoes`,
        meta: mealPlan?.name ?? "Sem plano ativo",
      },
      {
        title: "Hidratacao",
        value: `${waterConsumed}ml / ${user.waterGoal?.dailyGoalMl ?? 2500}ml`,
        meta: "Consumo de hoje",
      },
      {
        title: "Compromissos",
        value: `${appointments.length} hoje`,
        meta: appointments[0]?.title ?? "Agenda livre",
      },
    ],
    currentBook: currentBook
      ? {
          title: currentBook.title,
          author: currentBook.author,
        }
      : null,
    appointments: appointments.map((item) => ({
      id: item.id,
      title: item.title,
      startsAt: new Date(item.startsAt),
    })),
    waterConsumed,
    waterGoal: user.waterGoal?.dailyGoalMl ?? 2500,
  };
}

export async function getModuleData(slug: string) {
  const { userId } = await getCurrentUserContext();
  const supabase = await getDataClient();

  switch (slug) {
    case "treinos": {
      const plan = await getActiveWorkoutPlan(userId);

      return {
        planId: plan?.id ?? null,
        sections:
          plan?.days.map((day) => ({
            id: day.id,
            title: day.title || `Dia ${day.weekDay}`,
            subtitle: `Dia ${day.weekDay}`,
            items: day.exercises.map((exercise) => ({
              id: exercise.id,
              title: exercise.name,
              subtitle: exercise.notes ?? "",
            })),
          })) ?? [],
        countLabel: `${plan?.days.length ?? 0} dias configurados`,
        records:
          plan?.days.map((day) => ({
            id: day.id,
            title: day.title || `Dia ${day.weekDay}`,
            subtitle: `${day.exercises.length} exercicios`,
          })) ?? [],
      };
    }
    case "dieta": {
      const plan = await getActiveMealPlan(userId);

      return {
        planId: plan?.id ?? null,
        sections:
          plan?.sections.map((section) => ({
            id: section.id,
            title: section.title,
            subtitle: `${section.items.length} itens`,
            items: section.items.map((item) => ({
              id: item.id,
              title: item.description,
              subtitle: "",
            })),
          })) ?? [],
        countLabel: `${plan?.sections.length ?? 0} refeicoes`,
        records:
          plan?.sections.map((section) => ({
            id: section.id,
            title: section.title,
            subtitle: `${section.items.length} itens`,
          })) ?? [],
      };
    }
    case "livros": {
      const books = ((unwrapData(
        await supabase
          .from("Book")
          .select("*")
          .eq("userId", userId)
          .order("status", { ascending: true })
          .order("updatedAt", { ascending: false })
          .limit(12),
        "Failed to load books",
      ) ?? []) as BookRow[]);

      return {
        countLabel: `${books.length} livros`,
        records: books.map((book) => ({
          id: book.id,
          title: book.title,
          subtitle: `${book.author ?? "Autor indefinido"} • ${book.status}`,
          status: book.status,
        })),
      };
    }
    case "filmes": {
      const movies = ((unwrapData(
        await supabase
          .from("Movie")
          .select("*")
          .eq("userId", userId)
          .order("status", { ascending: true })
          .order("updatedAt", { ascending: false })
          .limit(12),
        "Failed to load movies",
      ) ?? []) as MovieRow[]);

      return {
        countLabel: `${movies.length} filmes`,
        records: movies.map((movie) => ({
          id: movie.id,
          title: movie.title,
          subtitle: `${movie.genre ?? "Genero livre"} • ${movie.status}`,
          status: movie.status,
        })),
      };
    }
    case "hidratacao": {
      const logs = ((unwrapData(
        await supabase
          .from("WaterLog")
          .select("*")
          .eq("userId", userId)
          .gte("occurredAt", startOfDay(new Date()).toISOString())
          .order("occurredAt", { ascending: false }),
        "Failed to load water logs",
      ) ?? []) as WaterLogRow[]);

      return {
        countLabel: `${logs.reduce((sum, item) => sum + item.amountMl, 0)}ml hoje`,
        records: logs.map((log) => ({
          id: log.id,
          title: `${log.amountMl}ml`,
          subtitle: new Date(log.occurredAt).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      };
    }
    case "compromissos": {
      const items = ((unwrapData(
        await supabase
          .from("Appointment")
          .select("*")
          .eq("userId", userId)
          .order("startsAt", { ascending: true })
          .limit(12),
        "Failed to load appointments",
      ) ?? []) as AppointmentRow[]);

      return {
        countLabel: `${items.length} registros`,
        records: items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: `${new Date(item.startsAt).toLocaleDateString("pt-BR")} • ${item.status}`,
          status: item.status,
        })),
      };
    }
    case "lembretes": {
      const items = ((unwrapData(
        await supabase
          .from("Reminder")
          .select("*")
          .eq("userId", userId)
          .order("status", { ascending: true })
          .order("dueAt", { ascending: true, nullsFirst: false })
          .limit(12),
        "Failed to load reminders",
      ) ?? []) as ReminderRow[]);

      return {
        countLabel: `${items.length} lembretes`,
        records: items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: `${item.priority} • ${item.status}`,
          status: item.status,
        })),
      };
    }
    case "remedios": {
      const items = ((unwrapData(
        await supabase
          .from("Medication")
          .select("*")
          .eq("userId", userId)
          .eq("isActive", true)
          .order("createdAt", { ascending: false })
          .limit(12),
        "Failed to load medications",
      ) ?? []) as MedicationRow[]);

      const schedules =
        items.length > 0
          ? ((unwrapData(
              await supabase
                .from("MedicationSchedule")
                .select("*")
                .in(
                  "medicationId",
                  items.map((item) => item.id),
                ),
              "Failed to load medication schedules",
            ) ?? []) as MedicationScheduleRow[])
          : [];

      return {
        countLabel: `${items.length} remedios ativos`,
        records: items.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: `${schedules.filter((schedule) => schedule.medicationId === item.id).length} horarios • ${item.frequencyType}`,
        })),
      };
    }
    case "exames": {
      const items = ((unwrapData(
        await supabase
          .from("Exam")
          .select("*")
          .eq("userId", userId)
          .order("updatedAt", { ascending: false })
          .limit(12),
        "Failed to load exams",
      ) ?? []) as ExamRow[]);

      return {
        countLabel: `${items.length} exames`,
        records: items.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: `${item.currentStatus} • ${item.category ?? "Geral"}`,
        })),
      };
    }
    default:
      return {
        countLabel: "0 itens",
        records: [],
      };
  }
}

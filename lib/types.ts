export type Task = {
  id: string;
  title: string;
  done: boolean;
  position: number;
};

export type WorkoutDay = {
  id: string;
  day_of_week: number;
  label: string;
};

export type WorkoutExercise = {
  id: string;
  day_id: string;
  name: string;
  done: boolean;
  position: number;
};

export type Meal = {
  id: string;
  label: string;
  month: string | null;
  items: string[];
  done: boolean;
  position: number;
};

export type Book = {
  id: string;
  title: string;
  author: string;
  year: number;
  read: boolean;
  position: number;
};

export type Movie = {
  id: string;
  title: string;
  year: number | null;
  genres: string[];
  poster_url: string | null;
  rating: number | null;
  watched: boolean;
  watched_at: string | null;
  position: number;
};

export type WaterEntry = {
  id: string;
  amount_ml: number;
  drank_at: string;
};

export type Appointment = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  done: boolean;
};

export type Reminder = {
  id: string;
  title: string;
  remind_at: string;
  recurrence: string | null;
  done: boolean;
};

export type Medication = {
  id: string;
  name: string;
  dosage: string | null;
  times: string[];
  active: boolean;
};

export type Exam = {
  id: string;
  title: string;
  scheduled_for: string | null;
  result: string | null;
  notes: string | null;
  done: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
};

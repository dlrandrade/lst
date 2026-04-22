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
  month: string;
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

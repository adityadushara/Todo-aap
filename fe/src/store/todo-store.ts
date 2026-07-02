import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Todo, Category, Tag, TodoPriority, TodoStatus } from "../types";

interface TodoFilters {
  search: string;
  status: TodoStatus | "all";
  priority: TodoPriority | "all";
  categoryId: string | "all";
  tagId: string | "all";
  dateRange: { start: string; end: string } | null;
}

interface ProductivityStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  todayCompleted: number;
  todayTotal: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  completionRate: number;
  streak: number;
}

interface TodoState {
  todos: Todo[];
  categories: Category[];
  tags: Tag[];
  filters: TodoFilters;
  isLoading: boolean;
  fetchTodos: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchTags: () => Promise<void>;
  createTodo: (data: Partial<Todo>) => Promise<void>;
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  archiveTodo: (id: string) => Promise<void>;
  restoreTodo: (id: string) => Promise<void>;
  createCategory: (data: Partial<Category>) => Promise<void>;
  createTag: (data: Partial<Tag>) => Promise<void>;
  setFilters: (filters: Partial<TodoFilters>) => void;
  getFilteredTodos: () => Todo[];
  getTodayTodos: () => Todo[];
  getUpcomingTodos: () => Todo[];
  getCompletedTodos: () => Todo[];
  getOverdueTodos: () => Todo[];
  getProductivityStats: () => ProductivityStats;
  getWeeklyProgress: () => { day: string; completed: number; total: number }[];
  getRecentActivity: () => { date: string; count: number }[];
}

const MOTIVATIONAL_QUOTES = [
  "The secret of getting ahead is getting started.",
  "The only way to do great work is to love what you do.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future depends on what you do today.",
  "Small steps lead to big changes.",
  "Progress, not perfection.",
  "You don't have to be great to start, but you have to start to be great.",
  "Every task you complete is a step toward your goals.",
  "Be productive today, so tomorrow can be even better.",
  "The best time to start was yesterday. The next best time is now.",
];

function getRandomQuote(): string {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function getWeekBounds(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}

function calculateStreak(todos: Todo[]): number {
  const completedDates = new Set(
    todos
      .filter((t) => t.status === "completed" && t.completed_at)
      .map((t) => t.completed_at!.split("T")[0]),
  );

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (completedDates.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  categories: [],
  tags: [],
  filters: {
    search: "",
    status: "all",
    priority: "all",
    categoryId: "all",
    tagId: "all",
    dateRange: null,
  },
  isLoading: false,

  fetchTodos: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ isLoading: false });
      return;
    }

    const { data } = await supabase
      .from("todos")
      .select("*, category:categories(*), tags:todo_tags(tag:tags(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const mapped = data.map((t: Record<string, unknown>) => ({
        ...t,
        tags: (t.tags as Array<{ tag: Tag }>)?.map((tt) => tt.tag) || [],
      }));
      set({ todos: mapped as Todo[], isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    if (data) set({ categories: data });
  },

  fetchTags: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("name");
    if (data) set({ tags: data });
  },

  createTodo: async (data: Partial<Todo>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimisticTodo: Todo = {
      id: tempId,
      user_id: user.id,
      title: data.title || "",
      description: data.description || null,
      priority: data.priority || "medium",
      status: "pending",
      due_date: data.due_date || null,
      completed_at: null,
      category_id: null,
      parent_id: null,
      recurrence: null,
      recurrence_interval: null,
      recurrence_end_date: null,
      archived_at: null,
      created_at: now,
      updated_at: now,
    };
    set((state) => ({ todos: [optimisticTodo, ...state.todos] }));

    const { error } = await supabase
      .from("todos")
      .insert({ ...data, user_id: user.id, status: "pending" });

    if (error) {
      set((state) => ({ todos: state.todos.filter((t) => t.id !== tempId) }));
      throw error;
    }

    const { data: inserted } = await supabase
      .from("todos")
      .select("*, category:categories(*), tags:todo_tags(tag:tags(*))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (inserted && inserted.length > 0) {
      const mapped = inserted.map((t: Record<string, unknown>) => ({
        ...t,
        tags: (t.tags as Array<{ tag: Tag }>)?.map((tt) => tt.tag) || [],
      }));
      set((state) => ({
        todos: [
          mapped[0] as Todo,
          ...state.todos.filter((t) => t.id !== tempId),
        ],
      }));
    } else {
      set((state) => ({ todos: state.todos.filter((t) => t.id !== tempId) }));
      await get().fetchTodos();
    }
  },

  updateTodo: async (id: string, data: Partial<Todo>) => {
    const { error } = await supabase.from("todos").update(data).eq("id", id);
    if (error) throw error;
    await get().fetchTodos();
  },

  deleteTodo: async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) throw error;
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
  },

  archiveTodo: async (id: string) => {
    await get().updateTodo(id, { status: "archived", archived_at: new Date().toISOString() });
  },

  restoreTodo: async (id: string) => {
    await get().updateTodo(id, { status: "pending", archived_at: null });
  },

  createCategory: async (data: Partial<Category>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase.from("categories").insert({ ...data, user_id: user.id });
    if (error) throw error;
    await get().fetchCategories();
  },

  createTag: async (data: Partial<Tag>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase.from("tags").insert({ ...data, user_id: user.id });
    if (error) throw error;
    await get().fetchTags();
  },

  setFilters: (filters: Partial<TodoFilters>) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  getFilteredTodos: () => {
    const { todos, filters } = get();
    return todos.filter((todo) => {
      if (todo.status === "archived") return false;
      if (filters.status !== "all" && todo.status !== filters.status) return false;
      if (filters.priority !== "all" && todo.priority !== filters.priority) return false;
      if (filters.categoryId !== "all" && todo.category_id !== filters.categoryId) return false;
      if (filters.search && !todo.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  },

  getTodayTodos: () => {
    const today = getTodayDateString();
    return get().todos.filter((t) => {
      if (t.status === "archived") return false;
      if (!t.due_date) return false;
      return t.due_date.split("T")[0] === today;
    });
  },

  getUpcomingTodos: () => {
    const today = getTodayDateString();
    return get().todos.filter((t) => {
      if (t.status === "archived" || t.status === "completed") return false;
      if (!t.due_date) return true;
      return t.due_date.split("T")[0] > today;
    });
  },

  getCompletedTodos: () => {
    return get().todos.filter((t) => t.status === "completed");
  },

  getOverdueTodos: () => {
    const today = getTodayDateString();
    return get().todos.filter((t) => {
      if (t.status === "completed" || t.status === "archived") return false;
      if (!t.due_date) return false;
      return t.due_date.split("T")[0] < today;
    });
  },

  getProductivityStats: () => {
    const todos = get().todos;
    const today = getTodayDateString();
    const week = getWeekBounds();
    const activeTodos = todos.filter((t) => t.status !== "archived");

    const total = activeTodos.length;
    const completed = todos.filter((t) => t.status === "completed").length;
    const pending = activeTodos.filter((t) => t.status === "pending").length;
    const overdue = activeTodos.filter((t) => {
      if (!t.due_date) return false;
      return t.due_date.split("T")[0] < today;
    }).length;

    const todayCompleted = todos.filter((t) => {
      if (t.status !== "completed" || !t.completed_at) return false;
      return t.completed_at.split("T")[0] === today;
    }).length;

    const todayTotal = todos.filter((t) => {
      if (t.status === "archived") return false;
      if (!t.due_date) return false;
      return t.due_date.split("T")[0] === today;
    }).length;

    const weeklyTodos = todos.filter((t) => {
      if (t.status === "archived") return false;
      if (!t.due_date) return false;
      const d = t.due_date.split("T")[0];
      return d >= week.start && d <= week.end;
    });

    const weeklyCompleted = weeklyTodos.filter((t) => t.status === "completed").length;
    const weeklyTotal = weeklyTodos.length;

    const completionRate = todos.length > 0 ? completed / todos.filter((t) => t.status !== "archived").length : 0;

    return {
      total,
      completed,
      pending,
      overdue,
      todayCompleted,
      todayTotal,
      weeklyCompleted,
      weeklyTotal,
      completionRate,
      streak: calculateStreak(todos),
    };
  },

  getWeeklyProgress: () => {
    const todos = get().todos;
    const week = getWeekBounds();
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekStart = new Date(week.start);

    return days.map((day, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];

      const dayTodos = todos.filter((t) => {
        if (t.status === "archived") return false;
        if (!t.due_date) return false;
        return t.due_date.split("T")[0] === dateStr;
      });

      return {
        day,
        completed: dayTodos.filter((t) => t.status === "completed").length,
        total: dayTodos.length,
      };
    });
  },

  getRecentActivity: () => {
    const todos = get().todos;
    const days: { date: string; count: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const count = todos.filter((t) => {
        if (t.status !== "completed" || !t.completed_at) return false;
        return t.completed_at.split("T")[0] === dateStr;
      }).length;

      days.push({ date: dateStr, count });
    }

    return days;
  },
}));

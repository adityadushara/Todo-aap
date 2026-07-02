export type TodoPriority = "low" | "medium" | "high" | "urgent";
export type TodoStatus = "pending" | "in_progress" | "completed" | "archived";
export type RecurrenceType = "daily" | "weekly" | "monthly" | "yearly" | "custom";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: TodoPriority;
  status: TodoStatus;
  due_date: string | null;
  completed_at: string | null;
  category_id: string | null;
  parent_id: string | null;
  recurrence: RecurrenceType | null;
  recurrence_interval: number | null;
  recurrence_end_date: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
  subtasks?: Todo[];
}

export interface Attachment {
  id: string;
  todo_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  push_enabled: boolean;
  daily_reminder_enabled: boolean;
  streak_reminder_enabled: boolean;
  daily_reminder_time: string;
  streak_reminder_time: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  todo_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type ThemeMode = "light" | "dark" | "system";

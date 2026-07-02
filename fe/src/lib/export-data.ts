import { supabase } from "./supabase";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { Todo, Category, Tag, UserSettings } from "../types";

export interface ExportPayload {
  tasks: Todo[];
  completedTasks: Todo[];
  categories: Category[];
  tags: Tag[];
  subtasks: Todo[];
  statistics: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    highPriority: number;
    completionRate: string;
  };
}

async function collectAllData(): Promise<ExportPayload> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const [todosRes, categoriesRes, tagsRes] = await Promise.all([
    supabase.from("todos").select("*, category:categories(name)").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("categories").select("*").eq("user_id", user.id).order("name"),
    supabase.from("tags").select("*").eq("user_id", user.id).order("name"),
  ]);

  const todos = (todosRes.data as any[]) || [];
  const completedTasks = todos.filter((t) => t.status === "completed");
  const subtasks = todos.filter((t) => t.parent_id !== null);
  const activeTodos = todos.filter((t) => t.status !== "archived" && t.parent_id === null);
  const completed = activeTodos.filter((t) => t.status === "completed").length;
  const pending = activeTodos.filter((t) => t.status === "pending").length;
  const highPriority = activeTodos.filter((t) => t.priority === "high" || t.priority === "urgent").length;
  
  const overdue = activeTodos.filter((t) => {
    if (!t.due_date || t.status === "completed") return false;
    return new Date(t.due_date) < new Date(new Date().toDateString());
  }).length;

  return {
    tasks: activeTodos,
    completedTasks,
    categories: (categoriesRes.data as Category[]) || [],
    tags: (tagsRes.data as Tag[]) || [],
    subtasks,
    statistics: {
      total: activeTodos.length,
      completed,
      pending,
      overdue,
      highPriority,
      completionRate: activeTodos.length > 0 ? `${Math.round((completed / activeTodos.length) * 100)}%` : "0%",
    },
  };
}

function cleanForCSV(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function objectToCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    const vals = headers.map((h) => cleanForCSV(row[h]));
    lines.push(vals.join(","));
  }
  return lines.join("\n");
}

function downloadOnWeb(content: string, filename: string, mimeType: string) {
  if (Platform.OS !== "web") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportBackupCSV() {
  const data = await collectAllData();
  
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`; // HH-mm
  const filename = `TaskFlow_Backup_${dateStr}_${timeStr}.csv`;

  const tasksCSV = objectToCSV(data.tasks.map((t) => ({
    "Task ID": t.id,
    "Title": t.title,
    "Description": t.description || "",
    "Priority": t.priority,
    "Category": t.category?.name || "",
    "Status": t.status,
    "Completed": t.status === "completed" ? "Yes" : "No",
    "Due Date": t.due_date ? new Date(t.due_date).toLocaleString() : "",
    "Created At": new Date(t.created_at).toLocaleString(),
    "Updated At": new Date(t.updated_at).toLocaleString(),
  })));

  const categoriesCSV = objectToCSV(data.categories.map((c) => ({
    "Category ID": c.id,
    "Name": c.name,
    "Color": c.color,
    "Created At": new Date(c.created_at).toLocaleString(),
  })));

  const subtasksCSV = objectToCSV(data.subtasks.map((st) => ({
    "Subtask ID": st.id,
    "Parent Task": st.parent_id,
    "Title": st.title,
    "Completed": st.status === "completed" ? "Yes" : "No",
    "Created At": new Date(st.created_at).toLocaleString(),
  })));

  const fullCSV = [
    "--- TASKS ---",
    tasksCSV,
    "",
    "--- CATEGORIES ---",
    categoriesCSV,
    "",
    "--- SUBTASKS ---",
    subtasksCSV,
    "",
    "--- STATISTICS ---",
    `Total Tasks,${data.statistics.total}`,
    `Completed Tasks,${data.statistics.completed}`,
    `Pending Tasks,${data.statistics.pending}`,
    `Completion %,${data.statistics.completionRate}`,
    `Overdue Tasks,${data.statistics.overdue}`,
    `High Priority Tasks,${data.statistics.highPriority}`,
  ].join("\n");

  if (Platform.OS === "web") {
    downloadOnWeb(fullCSV, filename, "text/csv");
  } else {
    try {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, fullCSV, { encoding: FileSystem.EncodingType.UTF8 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Save Backup",
          UTI: "public.comma-separated-values-text"
        });
      } else {
        throw new Error("Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error saving/sharing file:", error);
      throw error;
    }
  }
}

export async function exportToJSON() {
  const data = await collectAllData();
  const json = JSON.stringify(data, null, 2);
  const date = new Date();
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const timeStr = `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`; // HH-mm
  const filename = `TaskFlow_Backup_${dateStr}_${timeStr}.json`;

  if (Platform.OS === "web") {
    downloadOnWeb(json, filename, "application/json");
  } else {
    try {
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Save Backup",
          UTI: "public.json"
        });
      } else {
        throw new Error("Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error saving/sharing JSON file:", error);
      throw error;
    }
  }
}

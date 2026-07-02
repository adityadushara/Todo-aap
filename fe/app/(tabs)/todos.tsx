import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useTodoStore } from "../../src/store/todo-store";
import { PremiumTodoItem } from "../../src/components/PremiumTodoItem";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Snackbar } from "../../src/components/ui/Snackbar";
import { CelebrationOverlay } from "../../src/components/CelebrationOverlay";
import { useUIStore } from "../../src/store/ui-store";
import { Search, X, SlidersHorizontal, ListTodo } from "lucide-react-native";
import type { TodoPriority } from "../../src/types";

const PRIORITIES: { value: TodoPriority; label: string; color: string; bg: string }[] = [
  { value: "low", label: "Low", color: "#22C55E", bg: "bg-success" },
  { value: "medium", label: "Medium", color: "#F59E0B", bg: "bg-warning" },
  { value: "high", label: "High", color: "#EF4444", bg: "bg-error" },
  { value: "urgent", label: "Urgent", color: "#DC2626", bg: "bg-error" },
];

export default function TodosScreen() {
  const { fetchTodos, fetchCategories, fetchTags, updateTodo, deleteTodo, setFilters, getFilteredTodos, filters } = useTodoStore();
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({ visible: false, message: "", type: "success" });

  useEffect(() => { fetchTodos(); fetchCategories(); fetchTags(); }, []);
  const filteredTodos = getFilteredTodos();

  const handleSearch = useCallback((text: string) => { setSearchText(text); setFilters({ search: text }); }, [setFilters]);

  const handleToggle = async (id: string) => {
    const todo = useTodoStore.getState().todos.find((t) => t.id === id);
    if (!todo) return;
    const done = todo.status !== "completed";
    await updateTodo(id, { status: done ? "completed" : "pending", completed_at: done ? new Date().toISOString() : null });
    if (done) { setShowCelebration(true); setTimeout(() => setShowCelebration(false), 2500); }
  };

  const handleDelete = (id: string) => deleteTodo(id);

  const grouped = PRIORITIES.map((p) => ({ ...p, todos: filteredTodos.filter((t) => t.priority === p.value) })).filter((g) => g.todos.length > 0);

  return (
    <View className="flex-1 bg-background">
        <CelebrationOverlay visible={showCelebration} message="Task done!" />
        <Snackbar
          visible={snackbar.visible}
          message={snackbar.message}
          type={snackbar.type}
          onHide={() => setSnackbar((s) => ({ ...s, visible: false }))}
        />

        <View className="pt-20 px-6 pb-4 border-b border-border bg-surface">
          <Text className="text-4xl font-bold text-text tracking-tight">Tasks</Text>
          <Text className="text-base text-text-secondary mt-1">{filteredTodos.length} task{filteredTodos.length !== 1 ? "s" : ""}</Text>
        </View>

        <View className="px-6 py-4 bg-background">
          <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center bg-surface rounded-xl px-4 border border-border">
              <Search size={18} color="#94A3B8" />
              <TextInput 
                className="flex-1 py-3 pl-2 text-text text-base"
                placeholder="Search tasks..." 
                placeholderTextColor="#94A3B8" 
                value={searchText} 
                onChangeText={handleSearch} 
              />
              {searchText ? (
                <Pressable onPress={() => handleSearch("")} hitSlop={8}>
                  <X size={16} color="#94A3B8" />
                </Pressable>
              ) : null}
            </View>
            <Pressable 
              onPress={() => setShowFilters(!showFilters)} 
              className={`w-12 h-12 rounded-xl items-center justify-center border ${showFilters ? "bg-primary border-primary" : "bg-surface border-border"}`}
            >
              <SlidersHorizontal size={18} color={showFilters ? "#fff" : "#94A3B8"} />
            </Pressable>
          </View>

          {showFilters && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4" contentContainerClassName="gap-3">
              {["all", "pending", "completed"].map((s) => (
                <Pressable key={s} onPress={() => setFilters({ status: s as "all" | "pending" | "completed" })}
                  className={`px-5 py-2.5 rounded-full border ${filters.status === s ? "bg-primary border-primary" : "bg-surface border-border"}`}
                >
                  <Text className={`text-sm font-bold capitalize ${filters.status === s ? "text-white" : "text-text-secondary"}`}>
                    {s === "all" ? "All" : s}
                  </Text>
                </Pressable>
              ))}
              {PRIORITIES.map((p) => (
                <Pressable key={p.value} onPress={() => setFilters({ priority: filters.priority === p.value ? "all" : p.value })}
                  className={`px-5 py-2.5 rounded-full border ${filters.priority === p.value ? "border-transparent" : "bg-surface border-border"}`}
                  style={{ backgroundColor: filters.priority === p.value ? p.color : undefined }}
                >
                  <Text className={`text-sm font-bold ${filters.priority === p.value ? "text-white" : "text-text-secondary"}`}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <ScrollView 
          className="flex-1 px-6" 
          contentContainerClassName="pb-40 pt-2" 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          {filteredTodos.length === 0 ? (
            <EmptyState 
              icon={<ListTodo size={40} color="#6366F1" />} 
              title="No tasks found" 
              message="Create a new task to get started or adjust your filters" 
              actionLabel="Create Task" 
              onAction={() => useUIStore.getState().openCreateTask()} 
            />
          ) : grouped.map((group) => (
            <View key={group.value} className="mb-6">
              <View className="flex-row items-center gap-2 mb-3 pl-1">
                <View className={`w-1 h-4 rounded-full ${group.bg}`} />
                <Text className="text-base font-bold text-text">{group.label}</Text>
                <Text className="text-xs text-text-secondary">{group.todos.length}</Text>
              </View>
              {group.todos.map((todo, i) => (
                <PremiumTodoItem 
                  key={todo.id} 
                  todo={todo} 
                  onToggle={() => handleToggle(todo.id)} 
                  onPress={() => {}} 
                  onLongPress={() => handleDelete(todo.id)} 
                  index={i} 
                />
              ))}
            </View>
          ))}
        </ScrollView>
    </View>
  );
}

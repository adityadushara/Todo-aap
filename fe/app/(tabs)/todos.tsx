import { useState, useEffect, useCallback } from "react";
import { View, Text, TextInput, ScrollView, Pressable } from "react-native";
import { useTodoStore } from "../../src/store/todo-store";
import { PremiumTodoItem } from "../../src/components/PremiumTodoItem";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { Snackbar } from "../../src/components/ui/Snackbar";
import { CelebrationOverlay } from "../../src/components/CelebrationOverlay";
import { useUIStore } from "../../src/store/ui-store";
import { Search, X, SlidersHorizontal, ListTodo, Plus } from "lucide-react-native";
import type { TodoPriority } from "../../src/types";
import { colors } from "../../src/theme";

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
    <View className="flex-1 bg-background items-center">
      <CelebrationOverlay visible={showCelebration} message="Task completed! 🎉" />
      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        type={snackbar.type}
        onHide={() => setSnackbar((s) => ({ ...s, visible: false }))}
      />

      <View className="w-full max-w-5xl flex-1">
        {/* HEADER */}
        <View className="pt-16 px-6 pb-5 border-b border-border/80 bg-surface shadow-sm">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-4xl font-extrabold text-text tracking-tight">Tasks</Text>
              <Text className="text-sm font-semibold text-text-secondary mt-1">{filteredTodos.length} task{filteredTodos.length !== 1 ? "s" : ""} active</Text>
            </View>
            <Pressable 
              onPress={() => useUIStore.getState().openCreateTask()}
              className="flex-row items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary shadow-md shadow-primary/30 active:scale-95 transition-all"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus size={18} color="#fff" />
              <Text className="text-sm font-bold text-white">New Task</Text>
            </Pressable>
          </View>
        </View>

        {/* SEARCH & FILTERS BAR */}
        <View className="px-6 py-4 bg-background border-b border-border/40">
          <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center bg-surface rounded-2xl px-4 min-h-[48px] border border-border/80 shadow-sm">
              <Search size={18} color="#94A3B8" />
              <TextInput 
                className="flex-1 py-3 pl-3 text-text text-base"
                style={{ outlineStyle: "none" as any }}
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
              className={`w-12 h-12 rounded-2xl items-center justify-center border transition-all ${showFilters ? "bg-primary border-primary shadow-md shadow-primary/20" : "bg-surface border-border/80 shadow-sm"}`}
              style={{ backgroundColor: showFilters ? colors.primary : colors.surface }}
            >
              <SlidersHorizontal size={18} color={showFilters ? "#fff" : "#64748B"} />
            </Pressable>
          </View>

          {showFilters && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3.5" contentContainerClassName="gap-2.5 pb-1">
              {["all", "pending", "completed"].map((s) => (
                <Pressable key={s} onPress={() => setFilters({ status: s as "all" | "pending" | "completed" })}
                  className={`px-4 py-2 rounded-xl border ${filters.status === s ? "bg-primary border-primary shadow-sm" : "bg-surface border-border/80"}`}
                  style={{ backgroundColor: filters.status === s ? colors.primary : colors.surface }}
                >
                  <Text className={`text-xs font-bold capitalize ${filters.status === s ? "text-white" : "text-text-secondary"}`}>
                    {s === "all" ? "All Status" : s}
                  </Text>
                </Pressable>
              ))}
              {PRIORITIES.map((p) => (
                <Pressable key={p.value} onPress={() => setFilters({ priority: filters.priority === p.value ? "all" : p.value })}
                  className={`px-4 py-2 rounded-xl border ${filters.priority === p.value ? "border-transparent shadow-sm" : "bg-surface border-border/80"}`}
                  style={{ backgroundColor: filters.priority === p.value ? p.color : colors.surface }}
                >
                  <Text className={`text-xs font-bold ${filters.priority === p.value ? "text-white" : "text-text-secondary"}`}>
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        {/* TASK LIST */}
        <ScrollView 
          className="flex-1 px-6" 
          contentContainerClassName="pb-36 pt-4" 
          showsVerticalScrollIndicator={false} 
          keyboardShouldPersistTaps="handled"
        >
          {filteredTodos.length === 0 ? (
            <EmptyState 
              icon={<ListTodo size={44} color={colors.primary} />} 
              title="No tasks found" 
              message="Create a new task to get started or clear your filter criteria." 
              actionLabel="Create New Task" 
              onAction={() => useUIStore.getState().openCreateTask()} 
            />
          ) : grouped.map((group) => (
            <View key={group.value} className="mb-6">
              <View className="flex-row items-center gap-2 mb-3 pl-1">
                <View className={`w-1.5 h-4 rounded-full ${group.bg}`} style={{ backgroundColor: group.color }} />
                <Text className="text-base font-extrabold text-text tracking-tight">{group.label} Priority</Text>
                <View className="px-2 py-0.5 rounded-full bg-border/60">
                  <Text className="text-[11px] font-bold text-text-secondary">{group.todos.length}</Text>
                </View>
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
    </View>
  );
}

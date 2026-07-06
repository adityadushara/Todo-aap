import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTodoStore } from "../../src/store/todo-store";
import { PremiumTodoItem } from "../../src/components/PremiumTodoItem";
import { Card } from "../../src/components/ui/Card";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { CelebrationOverlay } from "../../src/components/CelebrationOverlay";
import { colors } from "../../src/theme";
import { CheckCircle2, Flame, Archive, Trophy } from "lucide-react-native";

export default function CompletedScreen() {
  const fetchTodos = useTodoStore((s) => s.fetchTodos);
  const getCompletedTodos = useTodoStore((s) => s.getCompletedTodos);
  const getProductivityStats = useTodoStore((s) => s.getProductivityStats);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => { fetchTodos(); }, []);

  const completedTodos = getCompletedTodos();
  const stats = getProductivityStats();

  const today = new Date().toDateString();

  const todayCompleted = completedTodos.filter((t) => t.completed_at && new Date(t.completed_at).toDateString() === today);
  const earlierCompleted = completedTodos.filter((t) => t.completed_at && new Date(t.completed_at).toDateString() !== today);

  const handleArchive = async (id: string) => {
    await updateTodo(id, { status: "archived", archived_at: new Date().toISOString() });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  return (
    <View className="flex-1 bg-background items-center">
      <CelebrationOverlay visible={showCelebration} message="Archived task! 📦" />

      <View className="w-full max-w-5xl flex-1">
        {/* HEADER */}
        <View className="pt-16 px-6 pb-5 border-b border-border/80 bg-surface shadow-sm">
          <Text className="text-4xl font-extrabold text-text tracking-tight">Completed</Text>
          <Text className="text-sm font-semibold text-text-secondary mt-1">{completedTodos.length} task{completedTodos.length !== 1 ? "s" : ""} accomplished</Text>
        </View>

        <ScrollView 
          className="flex-1 px-6" 
          contentContainerClassName="pb-36 pt-6" 
          showsVerticalScrollIndicator={false}
        >
          {completedTodos.length === 0 ? (
            <View className="pt-12">
              <EmptyState icon={<Trophy size={48} color={colors.warning} />} title="No completed tasks yet" message="Complete tasks on your dashboard or tasks screen to build your streak!" />
            </View>
          ) : (
            <>
              {/* STREAK CARD */}
              <Card className="p-6 mb-6 flex-row items-center gap-5 border border-border/80 shadow-md">
                <View className="w-14 h-14 rounded-2xl bg-warning/10 items-center justify-center border border-warning/20">
                  <Flame size={28} color={colors.warning} />
                </View>
                <View className="flex-1 gap-1">
                  <Text className="text-xl font-extrabold text-text tracking-tight">{stats.streak}-Day Streak</Text>
                  <Text className="text-xs font-semibold text-text-secondary">Keep the momentum going! {stats.completed} total completed.</Text>
                </View>
                <View className="px-3 py-1.5 rounded-full bg-success/15 border border-success/30">
                  <Text className="text-xs font-bold text-success">🔥 ACTIVE</Text>
                </View>
              </Card>

              {/* TODAY */}
              {todayCompleted.length > 0 && (
                <View className="mb-8">
                  <View className="flex-row items-center gap-2 mb-3 pl-1">
                    <CheckCircle2 size={18} color={colors.success} />
                    <Text className="text-lg font-extrabold text-text tracking-tight">Completed Today</Text>
                    <View className="px-2 py-0.5 rounded-full bg-success/15">
                      <Text className="text-xs font-bold text-success">{todayCompleted.length}</Text>
                    </View>
                  </View>
                  {todayCompleted.map((todo) => (
                    <View key={todo.id} className="mb-3">
                      <PremiumTodoItem todo={todo} onToggle={() => {}} onPress={() => {}} />
                      <Pressable 
                        onPress={() => handleArchive(todo.id)} 
                        className="align-self-end flex-row items-center gap-1.5 py-1 px-3 mt-1 ml-auto rounded-lg bg-surface border border-border/60 active:opacity-80"
                      >
                        <Archive size={12} color={colors.textTertiary} />
                        <Text className="text-xs font-semibold text-text-tertiary">Archive</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* EARLIER */}
              {earlierCompleted.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center gap-2 mb-3 pl-1">
                    <CheckCircle2 size={18} color={colors.primary} />
                    <Text className="text-lg font-extrabold text-text tracking-tight">Earlier</Text>
                    <View className="px-2 py-0.5 rounded-full bg-primary/10">
                      <Text className="text-xs font-bold text-primary" style={{ color: colors.primary }}>{earlierCompleted.length}</Text>
                    </View>
                  </View>
                  {earlierCompleted.map((todo) => (
                    <View key={todo.id} className="mb-3">
                      <PremiumTodoItem todo={todo} onToggle={() => {}} onPress={() => {}} />
                      <Pressable 
                        onPress={() => handleArchive(todo.id)} 
                        className="align-self-end flex-row items-center gap-1.5 py-1 px-3 mt-1 ml-auto rounded-lg bg-surface border border-border/60 active:opacity-80"
                      >
                        <Archive size={12} color={colors.textTertiary} />
                        <Text className="text-xs font-semibold text-text-tertiary">Archive</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

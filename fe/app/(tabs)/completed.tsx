import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useTodoStore } from "../../src/store/todo-store";
import { PremiumTodoItem } from "../../src/components/PremiumTodoItem";
import { PremiumCard } from "../../src/components/ui/PremiumCard";
import { EmptyState } from "../../src/components/ui/EmptyState";
import { CelebrationOverlay } from "../../src/components/CelebrationOverlay";
import { colors, typography, spacing, borderRadius } from "../../src/theme";
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
  };

  const handleUnarchive = async (id: string) => {
    await updateTodo(id, { status: "completed", archived_at: null });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CelebrationOverlay visible={showCelebration} message="Archived! 📦" />

      <View style={{ paddingTop: spacing["5xl"], paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
        <Text style={[typography.largeTitle, { color: colors.text }]}>Completed</Text>
        <Text style={[typography.callout, { color: colors.textSecondary, marginTop: spacing.xs }]}>{completedTodos.length} task{completedTodos.length !== 1 ? "s" : ""} done</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: spacing.xl }} contentContainerStyle={{ paddingBottom: 160, paddingTop: spacing.md }} showsVerticalScrollIndicator={false}>
        {completedTodos.length === 0 ? (
          <View style={{ paddingTop: 60 }}>
            <EmptyState icon={<Trophy size={40} color={colors.warning} />} title="No completed tasks" message="Complete your first task to see it here!" />
          </View>
        ) : (
          <>
            {/* STREAK CARD */}
            <PremiumCard style={{ flexDirection: "row", alignItems: "center", gap: spacing.lg, marginBottom: spacing.lg }}>
      <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: colors.warningLight, alignItems: "center", justifyContent: "center" }}>
        <Flame size={24} color={colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.title3, { color: colors.text }]}>{stats.streak}-day streak</Text>
                <Text style={[typography.caption1, { color: colors.textSecondary }]}>Keep it going! {stats.completed} total completed</Text>
              </View>
              <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: colors.successLight }}>
                <Text style={[typography.caption1, { color: colors.success, fontWeight: "700" }]}>🔥</Text>
              </View>
            </PremiumCard>

            {/* TODAY */}
            {todayCompleted.length > 0 && (
              <View style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm, paddingLeft: spacing.xs }}>
                  <CheckCircle2 size={16} color={colors.success} />
                  <Text style={[typography.headline, { color: colors.text }]}>Today</Text>
                  <Text style={[typography.caption1, { color: colors.textTertiary }]}>{todayCompleted.length}</Text>
                </View>
                {todayCompleted.map((todo, i) => (
                  <View key={todo.id} style={{ marginBottom: spacing.xs }}>
                    <PremiumTodoItem todo={todo} onToggle={() => {}} onPress={() => {}} />
                    <Pressable onPress={() => handleArchive(todo.id)} style={{ alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm }}>
                      <Archive size={12} color={colors.textTertiary} />
                      <Text style={[typography.caption2, { color: colors.textTertiary }]}>Archive</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* EARLIER */}
            {earlierCompleted.length > 0 && (
              <View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm, paddingLeft: spacing.xs }}>
                  <CheckCircle2 size={16} color={colors.primary} />
                  <Text style={[typography.headline, { color: colors.text }]}>Earlier</Text>
                  <Text style={[typography.caption1, { color: colors.textTertiary }]}>{earlierCompleted.length}</Text>
                </View>
                {earlierCompleted.map((todo, i) => (
                  <View key={todo.id} style={{ marginBottom: spacing.xs }}>
                    <PremiumTodoItem todo={todo} onToggle={() => {}} onPress={() => {}} />
                    <Pressable onPress={() => handleArchive(todo.id)} style={{ alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: spacing.xs, paddingHorizontal: spacing.sm }}>
                      <Archive size={12} color={colors.textTertiary} />
                      <Text style={[typography.caption2, { color: colors.textTertiary }]}>Archive</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

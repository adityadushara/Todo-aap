import { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { useAuthStore } from "../../src/store/auth-store";
import { useTodoStore } from "../../src/store/todo-store";
import { PremiumTodoItem } from "../../src/components/PremiumTodoItem";
import { Card } from "../../src/components/ui/Card";
import { ProgressRing } from "../../src/components/ui/ProgressRing";
import { DashboardSkeleton } from "../../src/components/ui/Skeleton";
import { CelebrationOverlay } from "../../src/components/CelebrationOverlay";
import { getGreeting, randomQuote } from "../../src/theme";
import { Flame, CalendarDays, Sparkles, ChevronRight, Target, Plus } from "lucide-react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useUIStore } from "../../src/store/ui-store";

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const fetchTodos = useTodoStore((s) => s.fetchTodos);
  const fetchCategories = useTodoStore((s) => s.fetchCategories);
  const isLoading = useTodoStore((s) => s.isLoading);
  const getTodayTodos = useTodoStore((s) => s.getTodayTodos);
  const getUpcomingTodos = useTodoStore((s) => s.getUpcomingTodos);
  const getProductivityStats = useTodoStore((s) => s.getProductivityStats);
  const getWeeklyProgress = useTodoStore((s) => s.getWeeklyProgress);
  const updateTodo = useTodoStore((s) => s.updateTodo);
  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebMsg, setCelebMsg] = useState("");

  const greeting = getGreeting();
  const [quote] = useState(randomQuote);

  useEffect(() => { fetchTodos(); fetchCategories(); }, []);

  const stats = getProductivityStats();
  const todayTodos = getTodayTodos();
  const upcomingTodos = getUpcomingTodos();
  const weeklyProgress = getWeeklyProgress();

  const fmtDate = () => {
    const d = new Date();
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  };

  const handleRefresh = async () => { setRefreshing(true); await fetchTodos(); setRefreshing(false); };

  const handleToggle = async (id: string) => {
    const todo = useTodoStore.getState().todos.find((t) => t.id === id);
    if (!todo) return;
    const done = todo.status !== "completed";
    await updateTodo(id, { status: done ? "completed" : "pending", completed_at: done ? new Date().toISOString() : null });
    if (done) { setCelebMsg("Task completed! 🎉"); setShowCelebration(true); setTimeout(() => setShowCelebration(false), 2500); }
  };

  if (isLoading && useTodoStore.getState().todos.length === 0) return <DashboardSkeleton />;

  return (
    <View className="flex-1 bg-background">
      <CelebrationOverlay visible={showCelebration} message={celebMsg} />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366F1" />}
      >
        {/* HERO */}
        <View className="pt-20 px-6 pb-12 bg-primary rounded-b-[32px]">
          <Animated.View entering={FadeInDown.delay(80).springify().damping(20)}>
            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-white tracking-tight">{greeting.emoji} {greeting.text},</Text>
                <Text className="text-4xl font-extrabold text-white -mt-1">{user?.display_name?.split(" ")[0] || "there"}</Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <CalendarDays size={14} color="rgba(255,255,255,0.7)" />
                  <Text className="text-sm text-white/80">{fmtDate()}</Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                <Pressable 
                  onPress={() => useUIStore.getState().openCreateTask()} 
                  className="w-11 h-11 rounded-2xl bg-white/15 items-center justify-center"
                >
                  <Plus size={24} color="#fff" />
                </Pressable>
                <Pressable 
                  onPress={() => router.push("/(tabs)/settings")} 
                  className="w-11 h-11 rounded-2xl bg-white/15 items-center justify-center"
                >
                  <Text className="text-xl">👤</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>

          {/* HERO CARD */}
          <Animated.View entering={FadeInDown.delay(150).springify().damping(18)} className="mt-8 bg-white/10 rounded-[24px] p-5 border border-white/10">
            <View className="flex-row items-center gap-5">
              <ProgressRing progress={stats.completionRate} size={88} strokeWidth={7} color="#fff" trackColor="rgba(255,255,255,0.15)" />
              <View className="flex-1 gap-2">
                <Text className="text-lg font-bold text-white">{stats.completed} of {stats.total} done</Text>
                <View className="flex-row flex-wrap gap-3">
                  <View className="flex-row items-center gap-1">
                    <Flame size={14} color="#F59E0B" />
                    <Text className="text-xs font-semibold text-white/90">{stats.streak}-day streak</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Sparkles size={14} color="#A5B4FC" />
                    <Text className="text-xs text-white/90">{stats.todayCompleted} done today</Text>
                  </View>
                </View>
                <Text className="text-xs italic text-white/60 mt-1">"{quote.text}"</Text>
              </View>
            </View>
          </Animated.View>

          {stats.overdue > 0 && (
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-4">
              <Pressable className="flex-row items-center gap-3 bg-error/15 px-5 py-3 rounded-xl">
                <View className="w-2 h-2 rounded-full bg-error" />
                <Text className="text-sm font-semibold text-error">{stats.overdue} overdue task{stats.overdue > 1 ? "s" : ""}</Text>
                <Text className="text-xs text-error ml-auto">Review →</Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* CONTENT */}
        <View className="px-6 -mt-8 gap-4 pb-32">
          
          {/* QUICK STATS */}
          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <View className="flex-row gap-4">
              {[
                { label: "Today", value: stats.todayCompleted, total: stats.todayTotal, bg: "bg-[#EEF2FF]", icon: "📋", tc: "text-primary" },
                { label: "Upcoming", value: upcomingTodos.length, total: 0, bg: "bg-[#F0FDF4]", icon: "📅", tc: "text-success" },
                { label: "Done", value: stats.completed, total: 0, bg: "bg-[#FFFBEB]", icon: "✅", tc: "text-warning" },
              ].map((s, i) => (
                <View key={i} className={`flex-1 rounded-2xl p-4 gap-1 ${s.bg}`}>
                  <Text className="text-lg mb-1">{s.icon}</Text>
                  <Text className={`text-2xl font-bold tracking-tight ${s.tc}`}>{s.total > 0 ? `${s.value}/${s.total}` : s.value}</Text>
                  <Text className="text-xs font-medium text-text-secondary">{s.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* WEEKLY OVERVIEW */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Card>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-lg font-bold text-text">This Week</Text>
                <View className="flex-row items-center gap-1">
                  <Target size={14} color="#64748B" />
                  <Text className="text-sm text-text-secondary">{stats.weeklyCompleted}/{stats.weeklyTotal} done</Text>
                </View>
              </View>
              <View className="flex-row justify-between items-end h-16">
                {weeklyProgress.map((day, i) => {
                  const maxVal = Math.max(...weeklyProgress.map((d) => d.total), 1);
                  const h = Math.max(4, (day.total / maxVal) * 52);
                  const isToday = i === (new Date().getDay() + 6) % 7;
                  return (
                    <View key={i} className="items-center gap-1 flex-1">
                      <View 
                        className={`w-1.5 rounded-full ${day.completed > 0 ? "bg-primary" : "bg-border"}`} 
                        style={{ height: h, opacity: day.total > 0 ? 1 : 0.3 }} 
                      />
                      <Text className={`text-[11px] ${isToday ? "text-primary font-bold" : "text-text-secondary font-medium"}`}>
                        {day.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </Animated.View>

          {/* TODAY'S TASKS */}
          <Animated.View entering={FadeInDown.delay(350).springify()}>
            <View className="flex-row items-center justify-between mt-3 mb-1">
              <Text className="text-xl font-bold text-text">Today</Text>
              <Pressable onPress={() => router.push("/(tabs)/todos")} className="flex-row items-center gap-1">
                <Text className="text-sm font-semibold text-primary">See all</Text>
                <ChevronRight size={14} color="#6366F1" />
              </Pressable>
            </View>
          </Animated.View>

          {todayTodos.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <Card className="items-center py-10">
                <Text className="text-4xl mb-4">🎉</Text>
                <Text className="text-lg font-bold text-text">All clear!</Text>
                <Text className="text-sm text-text-secondary text-center mt-1">No tasks for today. Enjoy your day!</Text>
              </Card>
            </Animated.View>
          ) : (
            todayTodos.slice(0, 5).map((todo, i) => (
              <PremiumTodoItem key={todo.id} todo={todo} onToggle={() => handleToggle(todo.id)} onPress={() => router.push("/(tabs)/todos")} index={i} />
            ))
          )}

          {/* UPCOMING */}
          {upcomingTodos.length > 0 && (
            <>
              <Animated.View entering={FadeInDown.delay(450).springify()}>
                <View className="flex-row items-center justify-between mt-4 mb-1">
                  <Text className="text-xl font-bold text-text">Upcoming</Text>
                  <View className="px-3 py-1 rounded-full bg-primary/10">
                    <Text className="text-xs font-semibold text-primary">{upcomingTodos.length} tasks</Text>
                  </View>
                </View>
              </Animated.View>
              {upcomingTodos.slice(0, 3).map((todo, i) => (
                <PremiumTodoItem key={todo.id} todo={todo} onToggle={() => handleToggle(todo.id)} onPress={() => router.push("/(tabs)/todos")} index={i} />
              ))}
            </>
          )}

          {/* MOTIVATION */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <Card className="p-5 mt-2">
              <View className="flex-row gap-5 items-start">
                <Text className="text-3xl mt-1">💪</Text>
                <View className="flex-1 gap-1">
                  <Text className="text-lg font-bold text-text">Keep going!</Text>
                  <Text className="text-sm text-text-secondary leading-relaxed">
                    {stats.streak > 0 ? `You're on a ${stats.streak}-day streak! That's amazing.` : `You've completed ${stats.completed} tasks so far. Keep the momentum!`}
                  </Text>
                </View>
              </View>
              {stats.streak > 0 && (
                <View className="flex-row gap-1 mt-4 pt-4 border-t border-border">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <View key={d} className={`flex-1 h-1 rounded-full ${d <= Math.min(stats.streak, 5) ? "bg-primary" : "bg-border"}`} />
                  ))}
                </View>
              )}
            </Card>
          </Animated.View>

        </View>
      </ScrollView>
    </View>
  );
}

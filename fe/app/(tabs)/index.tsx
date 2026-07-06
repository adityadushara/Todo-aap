import { useEffect, useState } from "react";
import { View, Text, ScrollView, RefreshControl, Pressable } from "react-native";
import { useAuthStore } from "../../src/store/auth-store";
import { useTodoStore } from "../../src/store/todo-store";
import { PremiumTodoItem } from "../../src/components/PremiumTodoItem";
import { Card } from "../../src/components/ui/Card";
import { ProgressRing } from "../../src/components/ui/ProgressRing";
import { DashboardSkeleton } from "../../src/components/ui/Skeleton";
import { CelebrationOverlay } from "../../src/components/CelebrationOverlay";
import { getGreeting, randomQuote, colors } from "../../src/theme";
import { Flame, CalendarDays, Sparkles, ChevronRight, Target, Plus, LogOut } from "lucide-react-native";
import { router } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useUIStore } from "../../src/store/ui-store";

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
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
    <View className="flex-1 bg-background items-center">
      <CelebrationOverlay visible={showCelebration} message={celebMsg} />
      <ScrollView 
        className="w-full"
        contentContainerClassName="items-center"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366F1" />}
      >
        <View className="w-full max-w-5xl">
          {/* HERO */}
          <View className="pt-16 px-6 pb-12 bg-primary rounded-b-[36px] shadow-lg shadow-primary/25" style={{ backgroundColor: colors.primary }}>
            <Animated.View entering={FadeInDown.delay(80).springify().damping(20)}>
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-white/90 tracking-tight">{greeting.emoji} {greeting.text},</Text>
                  <Text className="text-4xl font-extrabold text-white tracking-tight mt-0.5">{user?.display_name?.split(" ")[0] || "there"}</Text>
                  <View className="flex-row items-center gap-2 mt-2">
                    <CalendarDays size={14} color="rgba(255,255,255,0.8)" />
                    <Text className="text-sm font-medium text-white/80">{fmtDate()}</Text>
                  </View>
                </View>
                <View className="flex-row gap-3 items-center">
                  <Pressable 
                    onPress={() => useUIStore.getState().openCreateTask()} 
                    className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center border border-white/20 active:scale-95 transition-all"
                  >
                    <Plus size={24} color="#fff" />
                  </Pressable>
                  <Pressable 
                    onPress={() => router.push("/(tabs)/settings")} 
                    className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center border border-white/20 active:scale-95 transition-all"
                  >
                    <Text className="text-xl">👤</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>

            {/* HERO CARD */}
            <Animated.View entering={FadeInDown.delay(150).springify().damping(18)} className="mt-8 bg-white/15 rounded-[28px] p-6 border border-white/20 backdrop-blur-md">
              <View className="flex-row items-center gap-6">
                <ProgressRing progress={stats.completionRate} size={88} strokeWidth={8} color="#fff" trackColor="rgba(255,255,255,0.2)" />
                <View className="flex-1 gap-2">
                  <Text className="text-xl font-extrabold text-white tracking-tight">{stats.completed} of {stats.total} completed</Text>
                  <View className="flex-row flex-wrap gap-3">
                    <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                      <Flame size={14} color="#F59E0B" />
                      <Text className="text-xs font-bold text-white">{stats.streak}-day streak</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15">
                      <Sparkles size={14} color="#A5B4FC" />
                      <Text className="text-xs font-semibold text-white">{stats.todayCompleted} done today</Text>
                    </View>
                  </View>
                  <Text className="text-xs italic font-medium text-white/80 mt-1">"{quote.text}"</Text>
                </View>
              </View>
            </Animated.View>

            {stats.overdue > 0 && (
              <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-4">
                <Pressable className="flex-row items-center gap-3 bg-error/20 px-5 py-3.5 rounded-2xl border border-error/30">
                  <View className="w-2.5 h-2.5 rounded-full bg-error" />
                  <Text className="text-sm font-bold text-white">{stats.overdue} overdue task{stats.overdue > 1 ? "s" : ""}</Text>
                  <Text className="text-xs font-bold text-white ml-auto">Review →</Text>
                </Pressable>
              </Animated.View>
            )}
          </View>

          {/* CONTENT */}
          <View className="px-6 -mt-8 gap-5 pb-36">
            
            {/* QUICK STATS */}
            <Animated.View entering={FadeInDown.delay(250).springify()}>
              <View className="flex-row gap-4">
                {[
                  { label: "Today", value: stats.todayCompleted, total: stats.todayTotal, bg: "bg-[#EEF2FF]", icon: "📋", tc: "text-primary" },
                  { label: "Upcoming", value: upcomingTodos.length, total: 0, bg: "bg-[#F0FDF4]", icon: "📅", tc: "text-success" },
                  { label: "Done", value: stats.completed, total: 0, bg: "bg-[#FFFBEB]", icon: "✅", tc: "text-warning" },
                ].map((s, i) => (
                  <View key={i} className={`flex-1 rounded-2xl p-4 border border-slate-200/60 shadow-sm ${s.bg}`}>
                    <Text className="text-xl mb-1">{s.icon}</Text>
                    <Text className={`text-2xl font-black tracking-tight ${s.tc}`}>{s.total > 0 ? `${s.value}/${s.total}` : s.value}</Text>
                    <Text className="text-xs font-semibold text-text-secondary mt-0.5">{s.label}</Text>
                  </View>
                ))}
              </View>
            </Animated.View>

            {/* WEEKLY OVERVIEW */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Card className="p-6 border border-border/80 shadow-md">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="text-xl font-bold text-text tracking-tight">Weekly Overview</Text>
                  <View className="flex-row items-center gap-1.5 px-3 py-1 bg-background rounded-full border border-border">
                    <Target size={14} color="#64748B" />
                    <Text className="text-xs font-semibold text-text-secondary">{stats.weeklyCompleted}/{stats.weeklyTotal} done</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-end h-20">
                  {weeklyProgress.map((day, i) => {
                    const maxVal = Math.max(...weeklyProgress.map((d) => d.total), 1);
                    const h = Math.max(8, (day.total / maxVal) * 56);
                    const isToday = i === (new Date().getDay() + 6) % 7;
                    return (
                      <View key={i} className="items-center gap-2 flex-1">
                        <View 
                          className={`w-2.5 rounded-full ${day.completed > 0 ? "bg-primary" : "bg-border"}`} 
                          style={{ height: h, opacity: day.total > 0 ? 1 : 0.4, backgroundColor: day.completed > 0 ? colors.primary : colors.border }} 
                        />
                        <Text className={`text-xs ${isToday ? "text-primary font-extrabold" : "text-text-secondary font-medium"}`}>
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
              <View className="flex-row items-center justify-between mt-2 mb-2">
                <Text className="text-2xl font-bold text-text tracking-tight">Today</Text>
                <Pressable onPress={() => router.push("/(tabs)/todos")} className="flex-row items-center gap-1">
                  <Text className="text-sm font-bold text-primary" style={{ color: colors.primary }}>See all</Text>
                  <ChevronRight size={16} color={colors.primary} />
                </Pressable>
              </View>
            </Animated.View>

            {todayTodos.length === 0 ? (
              <Animated.View entering={FadeInDown.delay(400).springify()}>
                <Card className="items-center py-10 border border-border/80">
                  <Text className="text-5xl mb-3">🎉</Text>
                  <Text className="text-xl font-bold text-text">All clear for today!</Text>
                  <Text className="text-sm font-medium text-text-secondary text-center mt-1">No pending tasks. Take a break or create a new task.</Text>
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
                  <View className="flex-row items-center justify-between mt-4 mb-2">
                    <Text className="text-2xl font-bold text-text tracking-tight">Upcoming</Text>
                    <View className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                      <Text className="text-xs font-bold text-primary" style={{ color: colors.primary }}>{upcomingTodos.length} tasks</Text>
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
              <Card className="p-6 mt-2 border border-border/80 shadow-md">
                <View className="flex-row gap-5 items-start">
                  <Text className="text-4xl mt-1">💪</Text>
                  <View className="flex-1 gap-1">
                    <Text className="text-xl font-bold text-text tracking-tight">Keep up the momentum!</Text>
                    <Text className="text-sm font-medium text-text-secondary leading-relaxed">
                      {stats.streak > 0 ? `You are on a ${stats.streak}-day productivity streak! Keep going.` : `You've completed ${stats.completed} tasks so far. Great progress!`}
                    </Text>
                  </View>
                </View>
                {stats.streak > 0 && (
                  <View className="flex-row gap-1.5 mt-5 pt-4 border-t border-border/80">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <View key={d} className={`flex-1 h-1.5 rounded-full ${d <= Math.min(stats.streak, 5) ? "bg-primary" : "bg-border"}`} style={{ backgroundColor: d <= Math.min(stats.streak, 5) ? colors.primary : colors.border }} />
                    ))}
                  </View>
                )}
              </Card>
            </Animated.View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn } from "react-native-reanimated";
import { Check, Clock, ChevronRight } from "lucide-react-native";
import type { Todo } from "../types";

const priorityColors: Record<string, string> = {
  low: "#22C55E", medium: "#F59E0B", high: "#EF4444", urgent: "#DC2626",
};

interface PremiumTodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onPress: () => void;
  onLongPress?: () => void;
  index?: number;
}

export function PremiumTodoItem({ todo, onToggle, onPress, onLongPress, index = 0 }: PremiumTodoItemProps) {
  const scale = useSharedValue(1);
  const isCompleted = todo.status === "completed";
  const priorityColor = priorityColors[todo.priority];
  const categoryColor = todo.category?.color;

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const dateDisplay = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return "Today";
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return `${date.toLocaleDateString("en-US", { weekday: "short" })}, ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

  const isOverdue = todo.due_date && new Date(todo.due_date) < new Date(new Date().toDateString()) && !isCompleted;

  return (
    <Animated.View entering={FadeIn.delay(index * 50).springify().damping(20)} style={[animStyle, { marginBottom: 12 }]}>
      <Pressable
        onPress={onPress} onLongPress={onLongPress}
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.95 : 1,
        })}
        className="flex-row items-center bg-surface rounded-xl p-4 border border-border"
      >
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onToggle();
          }} 
          hitSlop={12}
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${isCompleted ? "border-primary bg-primary" : "border-border bg-transparent"}`}
        >
          {isCompleted && <Check size={14} color="#fff" strokeWidth={3} />}
        </Pressable>

        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            {categoryColor && <View style={{ backgroundColor: categoryColor }} className="w-2 h-2 rounded-full" />}
            <Text 
              className={`flex-1 text-base ${isCompleted ? "text-text-secondary line-through" : "text-text"}`} 
              numberOfLines={1}
            >
              {todo.title}
            </Text>
            {todo.priority !== "medium" && (
              <View style={{ backgroundColor: priorityColor }} className="w-1.5 h-1.5 rounded-full opacity-70" />
            )}
          </View>

          <View className="flex-row items-center gap-4">
            {todo.due_date && (
              <View className="flex-row items-center gap-1">
                <Clock size={12} color={isOverdue ? "#EF4444" : "#94A3B8"} />
                <Text className={`text-xs ${isOverdue ? "text-error font-semibold" : "text-text-secondary"}`}>
                  {dateDisplay(todo.due_date)}
                </Text>
              </View>
            )}
            {todo.description && (
              <Text className="text-xs text-text-secondary" numberOfLines={1}>
                {todo.description}
              </Text>
            )}
          </View>
        </View>
        <ChevronRight size={16} color="#94A3B8" />
      </Pressable>
    </Animated.View>
  );
}

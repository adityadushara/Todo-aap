import { Pressable, Text, Platform } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withSequence, interpolateColor, withTiming } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { TodoPriority } from "../../types";

interface PriorityChipProps {
  value: TodoPriority;
  label: string;
  emoji: string;
  color: string;
  selected: boolean;
  onSelect: () => void;
}

export function PriorityChip({ value, label, emoji, color, selected, onSelect }: PriorityChipProps) {
  const scale = useSharedValue(1);
  // Shared value to smoothly transition background and text colors
  const activeAnim = useSharedValue(selected ? 1 : 0);

  // When selected changes, animate activeAnim
  activeAnim.value = withTiming(selected ? 1 : 0, { duration: 250 });

  const animStyle = useAnimatedStyle(() => {
    // Background: Unselected -> 15% opacity tint, Selected -> Solid color
    const bgColor = interpolateColor(
      activeAnim.value,
      [0, 1],
      [color + "20", color]
    );

    // Text: Unselected -> Solid color, Selected -> White
    const textColor = interpolateColor(
      activeAnim.value,
      [0, 1],
      [color, "#FFFFFF"]
    );

    // Shadow opacity only when selected
    const shadowOpacity = activeAnim.value * 0.3;

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: bgColor,
      ...(Platform.OS === "web"
        ? { boxShadow: selected ? `0 4px 12px ${color}40` : "none" }
        : { shadowColor: color, shadowOffset: { width: 0, height: 4 }, shadowOpacity, shadowRadius: 8, elevation: selected ? 8 : 0 }),
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      activeAnim.value,
      [0, 1],
      [color, "#FFFFFF"]
    );
    return { color: textColor };
  });

  const handlePress = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withSpring(0.9, { damping: 15 }), withSpring(1, { damping: 12 }));
    onSelect();
  };

  return (
    <Animated.View style={[animStyle, { borderRadius: 16, overflow: "visible" }]}>
      <Pressable
        onPress={handlePress}
        style={{
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
          paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16,
        }}
      >
        <Text style={{ fontSize: 14 }}>{emoji}</Text>
        <Animated.Text style={[textStyle, {
          fontSize: 14, fontWeight: "700"
        }]}>
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

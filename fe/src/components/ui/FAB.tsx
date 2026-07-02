import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, borderRadius, shadow } from "../../theme";

interface FABProps {
  icon: React.ReactNode;
  onPress: () => void;
}

export function FAB({ icon, onPress }: FABProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ position: "absolute", bottom: 24, right: 24, zIndex: 100 }, animStyle]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress();
        }}
        onPressIn={() => { scale.value = withSpring(0.92, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 200 }); }}
        style={({ pressed }) => ({
          width: 56, height: 56, borderRadius: borderRadius.full,
          backgroundColor: pressed ? colors.primaryDark : colors.primary,
          alignItems: "center", justifyContent: "center",
          ...shadow(3),
        })}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
}

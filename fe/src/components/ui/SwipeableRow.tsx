import { View, Pressable, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, borderRadius, spacing, typography } from "../../theme";

interface SwipeAction {
  label: string;
  color: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  rightActions?: SwipeAction[];
}

export function SwipeableRow({ children, rightActions }: SwipeableRowProps) {
  const translateX = useSharedValue(0);
  const actionWidth = 80;
  const maxSwipe = (rightActions?.length ?? 0) * actionWidth;

  return (
    <View style={{ overflow: "hidden", borderRadius: borderRadius.xl }}>
      {rightActions && (
        <View style={{ position: "absolute", right: 0, top: 0, bottom: 0, flexDirection: "row" }}>
          {rightActions.map((action, i) => (
            <Pressable
              key={i}
              onPress={() => { translateX.value = withSpring(0); action.onPress(); }}
              style={{ width: actionWidth, backgroundColor: action.color, alignItems: "center", justifyContent: "center", gap: spacing.xs }}
            >
              {action.icon}
              <Text style={[typography.caption1, { color: "#fff", fontWeight: "600" }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <Animated.View style={useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }))}>
        {children}
      </Animated.View>
    </View>
  );
}

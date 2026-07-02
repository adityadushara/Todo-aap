import { View, type ViewStyle } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, borderRadius, spacing, shadow } from "../../theme";

interface PremiumCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  index?: number;
}

export function PremiumCard({ children, style, index = 0 }: PremiumCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify().damping(20).stiffness(200)}
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadow(2),
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

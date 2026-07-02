import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing,
} from "react-native-reanimated";
import { colors, borderRadius, spacing } from "../../theme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  br?: number;
}

export function Skeleton({ width = "100%", height = 20, br }: SkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1, true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ width: width as any, height, borderRadius: br ?? borderRadius.sm, backgroundColor: colors.skeleton }, animStyle]} />
  );
}

export function SkeletonCard() {
  return (
    <View style={{ padding: spacing.lg, borderRadius: borderRadius.xl, backgroundColor: colors.card, gap: spacing.md, marginBottom: spacing.md }}>
      <Skeleton width="60%" height={18} />
      <Skeleton width="90%" height={14} />
      <Skeleton width="40%" height={12} />
    </View>
  );
}

export function DashboardSkeleton() {
  return (
    <View style={{ padding: spacing.xl, gap: spacing.lg }}>
      <Skeleton width="50%" height={28} />
      <Skeleton width="70%" height={16} />
      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <View style={{ flex: 1 }}><Skeleton height={100} br={16} /></View>
        <View style={{ flex: 1 }}><Skeleton height={100} br={16} /></View>
      </View>
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </View>
  );
}

import { useEffect } from "react";
import { View, Text, Platform } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSequence, withSpring, runOnJS, FadeOut } from "react-native-reanimated";
import { colors, typography, spacing, borderRadius } from "../theme";
import { CheckCircle2 } from "lucide-react-native";
import { Confetti } from "./ui/Confetti";

interface CelebrationOverlayProps {
  visible: boolean;
  message?: string;
  onComplete?: () => void;
}

export function CelebrationOverlay({ visible, message = "Task completed!", onComplete }: CelebrationOverlayProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(withSpring(1.3, { damping: 10 }), withSpring(1, { damping: 15 }));
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20 });
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 500 }, () => { if (onComplete) runOnJS(onComplete)(); });
      }, 2200);
    } else {
      opacity.value = 0; scale.value = 0;
    }
  }, [visible]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }, { scale: scale.value }] }));

  if (!visible) return null;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998, alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <Confetti visible={visible} />
      <Animated.View style={[style, {
        backgroundColor: colors.card, borderRadius: borderRadius["2xl"],
        paddingVertical: spacing["3xl"], paddingHorizontal: spacing["4xl"],
        alignItems: "center", gap: spacing.md,
        ...(Platform.OS === "web"
          ? { boxShadow: "0 8px 32px rgba(108,99,255,0.12)" }
          : { shadowColor: "#6C63FF", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 32, elevation: 8 }),
      }]}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.successLight, alignItems: "center", justifyContent: "center" }}>
          <CheckCircle2 size={32} color={colors.success} />
        </View>
        <Text style={[typography.title3, { color: colors.text }]}>{message}</Text>
        <Text style={[typography.subhead, { color: colors.textSecondary }]}>Keep up the momentum!</Text>
      </Animated.View>
    </View>
  );
}

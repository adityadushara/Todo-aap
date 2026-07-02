import { useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle, useSharedValue, withTiming, withDelay,
  withSequence, Easing, FadeOut,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLORS = ["#6C63FF", "#8B7CFF", "#22C55E", "#F59E0B", "#A78BFA", "#3B82F6"];
const PIECES = 25;

function Piece({ index, color }: { index: number; color: string }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(-20);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const delay = index * 35;
    tx.value = withDelay(delay, withTiming((Math.random() - 0.5) * SCREEN_WIDTH * 1.4, { duration: 2000, easing: Easing.out(Easing.cubic) }));
    ty.value = withDelay(delay, withTiming(300 + Math.random() * 500, { duration: 2500, easing: Easing.out(Easing.cubic) }));
    rotate.value = withDelay(delay, withTiming(Math.random() * 720 - 360, { duration: 2000 }));
    scale.value = withDelay(delay, withSequence(withTiming(1.2, { duration: 200 }), withTiming(0.8, { duration: 1800 })));
    opacity.value = withDelay(delay + 1800, withTiming(0, { duration: 700 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { rotate: `${rotate.value}deg` }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const isCircle = index % 3 === 0;
  const s = 5 + Math.random() * 8;
  return (
    <Animated.View style={[{ position: "absolute", top: 80, left: SCREEN_WIDTH / 2, width: s, height: isCircle ? s : s * 1.5, borderRadius: isCircle ? s / 2 : 2, backgroundColor: color }, style]} />
  );
}

export function Confetti({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <Animated.View exiting={FadeOut.duration(500)} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: "none" }}>
      {Array.from({ length: PIECES }).map((_, i) => <Piece key={i} index={i} color={COLORS[i % COLORS.length]} />)}
    </Animated.View>
  );
}

import { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, borderRadius, spacing, typography, shadow } from "../../theme";
import { CheckCircle2, XCircle } from "lucide-react-native";

interface SnackbarProps {
  visible: boolean;
  message: string;
  type?: "success" | "error";
  onHide?: () => void;
  duration?: number;
}

export function Snackbar({ visible, message, type = "success", onHide, duration = 3000 }: SnackbarProps) {
  const translateY = useSharedValue(150);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withSpring(0, { damping: 18, stiffness: 250 });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        translateY.value = withSpring(150, { damping: 18, stiffness: 250 });
        setTimeout(() => { setMounted(false); onHide?.(); }, 200);
      }, duration);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!mounted) return null;

  return (
    <Animated.View style={[{
      position: "absolute", bottom: 100, left: 20, right: 20,
      zIndex: 9999,
    }, animStyle]}>
      <View style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 20, paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: type === "success" ? colors.success : colors.danger,
        ...shadow(4),
      }}>
        {type === "success" ? (
          <CheckCircle2 size={20} color="#fff" />
        ) : (
          <XCircle size={20} color="#fff" />
        )}
        <Text style={[typography.subhead, { color: "#fff", fontWeight: "600", flex: 1 }]}>{message}</Text>
      </View>
    </Animated.View>
  );
}

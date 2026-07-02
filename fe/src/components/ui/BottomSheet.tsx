import { useEffect } from "react";
import { View, Text, Pressable, Dimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn } from "react-native-reanimated";
import { colors, borderRadius, spacing, typography, shadow } from "../../theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : SCREEN_HEIGHT, { damping: 25, stiffness: 250 });
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay, zIndex: 1000, justifyContent: "flex-end" }}
    >
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <Animated.View style={[{
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius["3xl"],
        borderTopRightRadius: borderRadius["3xl"],
        paddingTop: spacing.lg,
        paddingBottom: spacing["4xl"],
        maxHeight: SCREEN_HEIGHT * 0.85,
      }, sheetStyle, shadow(4)]}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: spacing.lg }} />
        {title && <Text style={[typography.title2, { color: colors.text, paddingHorizontal: spacing.xl, marginBottom: spacing.lg }]}>{title}</Text>}
        <View style={{ paddingHorizontal: spacing.xl }}>{children}</View>
      </Animated.View>
    </Animated.View>
  );
}

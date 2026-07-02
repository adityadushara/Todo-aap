import { useEffect, useCallback } from "react";
import { View, Pressable, ActivityIndicator, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  interpolateColor,
  type WithSpringConfig,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, shadow } from "../../theme";

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

const TRACK = { width: 52, height: 30, radius: 15 };
const THUMB = { size: 26, radius: 13 };
const PADDING = (TRACK.height - THUMB.size) / 2;
const THUMB_TRANSLATE_RANGE = TRACK.width - THUMB.size - PADDING * 2;

const SPRING: WithSpringConfig = {
  stiffness: 220,
  damping: 18,
  mass: 0.8,
};

const PRESS_SPRING: WithSpringConfig = {
  stiffness: 300,
  damping: 12,
  mass: 0.5,
};

const COLOR_OFF = "#E5E7EB";
const COLOR_ON = colors.primary;

export function ToggleSwitch({
  value,
  onValueChange,
  disabled = false,
  loading = false,
  accessibilityLabel,
}: ToggleSwitchProps) {
  const thumbPosition = useSharedValue(value ? 1 : 0);
  const trackProgress = useSharedValue(value ? 1 : 0);
  const thumbScale = useSharedValue(1);

  useEffect(() => {
    thumbPosition.value = withSpring(value ? 1 : 0, SPRING);
    trackProgress.value = withSpring(value ? 1 : 0, SPRING);
  }, [value]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;

    const next = !value;

    thumbPosition.value = withSpring(next ? 1 : 0, SPRING);
    trackProgress.value = withSpring(next ? 1 : 0, SPRING);
    thumbScale.value = withSequence(
      withSpring(0.95, PRESS_SPRING),
      withSpring(1.05, PRESS_SPRING),
      withSpring(1, SPRING),
    );

    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // haptics not available
      }
    }

    onValueChange(next);
  }, [value, disabled, loading, onValueChange]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      trackProgress.value,
      [0, 1],
      [COLOR_OFF, COLOR_ON],
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: thumbPosition.value * THUMB_TRANSLATE_RANGE },
      { scale: thumbScale.value },
    ],
  }));

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: disabled || loading }}
      accessibilityLabel={accessibilityLabel || "Toggle switch"}
      style={{
        width: TRACK.width + 8,
        height: TRACK.height + 8,
        alignItems: "center",
        justifyContent: "center",
      }}
      hitSlop={4}
    >
      <Animated.View
        style={[
          {
            width: TRACK.width,
            height: TRACK.height,
            borderRadius: TRACK.radius,
            justifyContent: "center",
            paddingHorizontal: PADDING,
          },
          trackStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              width: THUMB.size,
              height: THUMB.size,
              borderRadius: THUMB.radius,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              ...shadow(2),
            },
            thumbStyle,
          ]}
        >
          {loading ? (
            <ActivityIndicator size={14} color={colors.primary} />
          ) : null}
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

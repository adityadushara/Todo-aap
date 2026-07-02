import { useState } from "react";
import { View, TextInput, Text, Pressable, type TextInputProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, borderRadius, spacing, typography } from "../../theme";

interface PremiumInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function PremiumInput({
  label, error, leftIcon, rightIcon, onRightIconPress, style, ...props
}: PremiumInputProps) {
  const [focused, setFocused] = useState(false);
  const borderWidth = useSharedValue(1);

  const borderAnim = useAnimatedStyle(() => ({
    borderWidth: withSpring(focused ? 2 : 1, { damping: 20, stiffness: 300 }),
  }));

  return (
    <View style={{ gap: spacing.xs }}>
      {label && (
        <Text style={[typography.subhead, { color: colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          {
            flexDirection: "row", alignItems: "center",
            backgroundColor: focused ? colors.surface : colors.background,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.md,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
            minHeight: 48,
          },
          borderAnim,
        ]}
      >
        {leftIcon && <View style={{ marginRight: spacing.sm }}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={colors.textTertiary}
          style={[
            typography.body,
            { flex: 1, paddingVertical: spacing.md, color: colors.text },
            style,
          ]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} style={{ marginLeft: spacing.sm }}>
            {rightIcon}
          </Pressable>
        )}
      </Animated.View>
      {error && <Text style={[typography.caption1, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

import React, { useState } from "react";
import { View, TextInput, Text, Pressable, type TextInputProps, Platform } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { colors } from "../../theme";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerClassName = "",
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const borderWidth = useSharedValue(1);

  const borderAnim = useAnimatedStyle(() => ({
    borderWidth: withTiming(focused ? 2 : 1, { duration: 150 }),
    borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
    backgroundColor: focused ? "#FFFFFF" : colors.background,
  }));

  return (
    <View className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-semibold text-text-secondary ml-0.5">
          {label}
        </Text>
      )}
      <Animated.View
        className="flex-row items-center rounded-2xl px-4 min-h-[52px]"
        style={[borderAnim, style]}
      >
        {leftIcon && <View className="mr-3 items-center justify-center">{leftIcon}</View>}
        <TextInput
          placeholderTextColor="#94A3B8"
          className="flex-1 text-base text-text py-3.5"
          style={{
            color: colors.text,
            outlineStyle: "none" as any,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} className="ml-3 items-center justify-center p-1">
            {rightIcon}
          </Pressable>
        )}
      </Animated.View>
      {error && <Text className="text-xs font-semibold text-error ml-1">{error}</Text>}
    </View>
  );
}

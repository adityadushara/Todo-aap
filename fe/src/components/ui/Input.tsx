import React, { useState } from "react";
import { View, TextInput, Text, Pressable, type TextInputProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

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
  }));

  return (
    <View className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <Text className="text-sm font-medium text-text-secondary">
          {label}
        </Text>
      )}
      <Animated.View
        className={`flex-row items-center rounded-lg px-4 min-h-[48px] ${
          focused ? "bg-surface" : "bg-background"
        } ${error ? "border-error" : focused ? "border-primary" : "border-border"}`}
        style={borderAnim}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          placeholderTextColor="#94A3B8"
          className="flex-1 text-base text-text py-3"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} className="ml-2">
            {rightIcon}
          </Pressable>
        )}
      </Animated.View>
      {error && <Text className="text-xs text-error">{error}</Text>}
    </View>
  );
}

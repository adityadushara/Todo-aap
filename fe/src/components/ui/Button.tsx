import React from 'react';
import { Text, Pressable, PressableProps, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  onPressIn,
  onPressOut,
  onPress,
  className = '',
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = (e: any) => {
    if (!disabled && !isLoading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.8, { duration: 150 });
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 150 });
    onPressOut?.(e);
  };

  const handlePress = (e: any) => {
    if (!disabled && !isLoading) {
      onPress?.(e);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : opacity.value,
  }));

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary border border-transparent';
      case 'secondary':
        return 'bg-text border border-transparent';
      case 'outline':
        return 'bg-transparent border border-border';
      case 'ghost':
        return 'bg-transparent border border-transparent';
      default:
        return 'bg-primary border border-transparent';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return 'text-surface';
      case 'outline':
      case 'ghost':
        return 'text-text';
      default:
        return 'text-surface';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-10 px-4 rounded-sm';
      case 'md':
        return 'h-12 px-6 rounded-md';
      case 'lg':
        return 'h-14 px-8 rounded-lg';
      default:
        return 'h-12 px-6 rounded-md';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm font-medium';
      case 'md':
        return 'text-base font-semibold';
      case 'lg':
        return 'text-lg font-bold';
      default:
        return 'text-base font-semibold';
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={animatedStyle}
      className={`flex-row items-center justify-center ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : '#6366F1'} size="small" />
      ) : (
        <>
          {leftIcon && <Animated.View className="mr-2">{leftIcon}</Animated.View>}
          <Text className={`${getTextStyles()} ${getTextSizeStyles()} text-center`}>
            {label}
          </Text>
          {rightIcon && <Animated.View className="ml-2">{rightIcon}</Animated.View>}
        </>
      )}
    </AnimatedPressable>
  );
}

import React from 'react';
import { Text, Pressable, PressableProps, ActivityIndicator, Platform, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
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
  style,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = (e: any) => {
    if (!disabled && !isLoading) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      scale.value = withSpring(0.97, { damping: 15, stiffness: 350 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 350 });
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

  const getVariantNativeStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary, borderColor: 'transparent' };
      case 'secondary':
        return { backgroundColor: colors.text, borderColor: 'transparent' };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 };
      case 'ghost':
        return { backgroundColor: 'transparent', borderColor: 'transparent' };
      default:
        return { backgroundColor: colors.primary, borderColor: 'transparent' };
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return colors.text;
      default:
        return '#FFFFFF';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-10 px-4 rounded-xl';
      case 'md':
        return 'h-12 px-6 rounded-2xl';
      case 'lg':
        return 'h-14 px-8 rounded-2xl';
      default:
        return 'h-12 px-6 rounded-2xl';
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm font-semibold';
      case 'md':
        return 'text-base font-bold';
      case 'lg':
        return 'text-lg font-bold';
      default:
        return 'text-base font-bold';
    }
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || isLoading}
      style={[
        getVariantNativeStyles(),
        { cursor: disabled || isLoading ? 'default' : 'pointer' } as any,
        style as StyleProp<ViewStyle>,
        animatedStyle,
      ]}
      className={`flex-row items-center justify-center ${getSizeStyles()} ${className}`}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {leftIcon && <Animated.View className="mr-2.5 flex-row items-center justify-center">{leftIcon}</Animated.View>}
          <Text
            style={{ color: getTextColor() }}
            className={`${getTextSizeStyles()} text-center tracking-tight`}
          >
            {label}
          </Text>
          {rightIcon && <Animated.View className="ml-2.5 flex-row items-center justify-center">{rightIcon}</Animated.View>}
        </>
      )}
    </AnimatedPressable>
  );
}

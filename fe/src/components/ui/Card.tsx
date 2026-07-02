import { View, type ViewProps } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export function Card({ children, index = 0, className = "", ...props }: CardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify().damping(20).stiffness(200)}
      className={`bg-surface rounded-xl p-4 border border-border ${className}`}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

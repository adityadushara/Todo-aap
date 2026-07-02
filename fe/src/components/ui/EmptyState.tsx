import { View, Text } from "react-native";
import { Button } from "./Button";
import Animated, { FadeIn } from "react-native-reanimated";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      className="flex-1 items-center justify-center p-8 gap-4"
    >
      <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-2">
        {icon}
      </View>
      <Text className="text-2xl font-bold text-text text-center">
        {title}
      </Text>
      <Text className="text-base text-text-secondary text-center max-w-[280px]">
        {message}
      </Text>
      {actionLabel && onAction && (
        <View className="mt-4">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      )}
    </Animated.View>
  );
}

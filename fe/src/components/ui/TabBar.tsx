import { View, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useSheetContext } from "../../contexts/SheetContext";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";

export function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isSheetOpen } = useSheetContext();

  if (isSheetOpen) return null;

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOutDown.duration(300)}
      className="absolute flex-row items-center justify-around h-16 bg-surface/95 border border-border/80 rounded-full px-2"
      style={{
        bottom: insets.bottom + 24,
        left: 24,
        right: 24,
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        if (route.name === "create") {
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate("create")}
              className="w-12 h-12 rounded-2xl bg-primary items-center justify-center -mt-8 shadow-lg shadow-primary/30"
            >
              <Plus size={24} color="#fff" />
            </Pressable>
          );
        }

        const label = options.title !== undefined ? options.title : route.name;
        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className="items-center justify-center py-2 px-3 min-w-[56px]"
          >
            <View className={`w-7 h-1 rounded-full mb-1 ${isFocused ? "bg-primary" : "bg-transparent"}`} />
            <View className={`w-8 h-8 rounded-lg items-center justify-center ${isFocused ? "bg-primary/10" : "bg-transparent"}`}>
              {options.tabBarIcon?.({
                focused: isFocused,
              })}
            </View>
            <Text className={`text-[10px] tracking-wide mt-1 ${isFocused ? "font-bold text-primary" : "font-medium text-text-secondary"}`}>
              {label === "index" ? "Home" : label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

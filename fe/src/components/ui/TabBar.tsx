import { View, Pressable, Text, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import { useSheetContext } from "../../contexts/SheetContext";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
import { colors } from "../../theme";

export function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isSheetOpen } = useSheetContext();

  if (isSheetOpen) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 20,
        left: 0,
        right: 0,
        alignItems: "center",
        pointerEvents: "box-none",
        zIndex: 1000,
      }}
    >
      <Animated.View
        entering={FadeInUp.duration(300)}
        exiting={FadeOutDown.duration(300)}
        className="flex-row items-center justify-around h-16 bg-surface/95 border border-border/80 rounded-full px-3 w-11/12 max-w-lg"
        style={{
          shadowColor: "#0F172A",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
          backdropFilter: "blur(12px)" as any,
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
                className="w-12 h-12 rounded-2xl bg-primary items-center justify-center -mt-6 shadow-lg shadow-primary/40 active:scale-95 transition-all"
                style={{ backgroundColor: colors.primary }}
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
              className="items-center justify-center py-1.5 px-4 min-w-[64px] rounded-2xl"
              style={{ cursor: "pointer" } as any}
            >
              <View className={`w-8 h-1 rounded-full mb-1 ${isFocused ? "bg-primary" : "bg-transparent"}`} style={{ backgroundColor: isFocused ? colors.primary : "transparent" }} />
              <View className={`w-8 h-8 rounded-xl items-center justify-center ${isFocused ? "bg-primary/10" : "bg-transparent"}`}>
                {options.tabBarIcon?.({
                  focused: isFocused,
                })}
              </View>
              <Text className={`text-[11px] tracking-tight mt-1 ${isFocused ? "font-bold text-primary" : "font-medium text-text-secondary"}`} style={{ color: isFocused ? colors.primary : colors.textSecondary }}>
                {label === "index" ? "Home" : label}
              </Text>
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

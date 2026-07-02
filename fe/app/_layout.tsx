import "react-native-gesture-handler";
import "../src/global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useAuthStore } from "../src/store/auth-store";
import { View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { ListTodo } from "lucide-react-native";
import { colors, typography, borderRadius } from "../src/theme";
import { CreateTaskSheet } from "../src/components/ui/CreateTaskSheet";
import { SheetProvider } from "../src/contexts/SheetContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    initialize().finally(() => SplashScreen.hideAsync());
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: "center", gap: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: borderRadius.xl, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
            <ListTodo size={36} color="#fff" />
          </View>
          <Text style={[typography.title1, { color: colors.text }]}>TaskFlow</Text>
          <ActivityIndicator size="small" color={colors.primary} />
        </Animated.View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SheetProvider>
          <BottomSheetModalProvider>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen name="(auth)" options={{ animation: "slide_from_left" }} />
            <Stack.Screen name="(tabs)" options={{ animation: "slide_from_right" }} />
          </Stack>
          <StatusBar style="dark" />
            <CreateTaskSheet />
          </View>
        </BottomSheetModalProvider>
        </SheetProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

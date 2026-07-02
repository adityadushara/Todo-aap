import { Tabs } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";
import { Redirect } from "expo-router";
import { View } from "react-native";
import { TabBar } from "../../src/components/ui/TabBar";
import { LayoutDashboard, ListTodo, CircleCheck, User } from "lucide-react-native";
import { colors } from "../../src/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";

function TabIcon({ Icon, focused }: { Icon: typeof LayoutDashboard; focused: boolean }) {
  return (
    <View className="w-7 h-7 items-center justify-center">
      <Icon size={20} color={focused ? "#6366F1" : "#94A3B8"} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

export default function TabLayout() {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Redirect href="/(auth)/sign-in" />;

  return (
    <SafeAreaProvider>
        <Tabs tabBar={(props: any) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ focused }) => <TabIcon Icon={LayoutDashboard} focused={focused} /> }} />
          <Tabs.Screen name="todos" options={{ title: "Tasks", tabBarIcon: ({ focused }) => <TabIcon Icon={ListTodo} focused={focused} /> }} />
          <Tabs.Screen name="completed" options={{ title: "Done", tabBarIcon: ({ focused }) => <TabIcon Icon={CircleCheck} focused={focused} /> }} />
          <Tabs.Screen name="settings" options={{ title: "Profile", tabBarIcon: ({ focused }) => <TabIcon Icon={User} focused={focused} /> }} />
        </Tabs>
    </SafeAreaProvider>
  );
}

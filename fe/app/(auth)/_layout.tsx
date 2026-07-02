import { Stack } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";
import { Redirect } from "expo-router";

export default function AuthLayout() {
  const user = useAuthStore((s) => s.user);

  if (user) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
      initialRouteName="sign-in"
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}

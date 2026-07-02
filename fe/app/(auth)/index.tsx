import { Redirect } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";

export default function AuthIndex() {
  const user = useAuthStore((s) => s.user);
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/(auth)/sign-in" />;
}

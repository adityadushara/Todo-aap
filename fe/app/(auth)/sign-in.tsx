import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Mail, Lock, Eye, EyeOff, LogIn, ListTodo } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");
  
  const signIn = useAuthStore((s) => s.signIn);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  const handleSignIn = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields"); return; }
    setIsLoading("email");
    try { await signIn(email, password); router.replace("/(tabs)"); }
    catch (err) { setError((err as Error).message); }
    finally { setIsLoading(null); }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading("google");
    try {
      await signInWithGoogle();
    } catch (err) {
      const message = (err as Error).message?.toLowerCase() || "";
      if (!message.includes("cancelled") && !message.includes("dismissed") && !message.includes("popup closed")) {
        setError((err as Error).message);
      }
    } finally {
      setIsLoading(null);
    }
  };

  const isPending = isLoading !== null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-background"
    >
      <ScrollView 
        contentContainerClassName="flex-1 justify-center p-8" 
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} className="items-center mb-12">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-6">
            <ListTodo size={32} color="#fff" />
          </View>
          <Text className="text-3xl font-bold text-text">Welcome back</Text>
          <Text className="text-base text-text-secondary mt-2">Sign in to manage your tasks</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} className="gap-5">
          {error ? (
            <View className="p-4 rounded-xl bg-error/10 border border-error/30">
              <Text className="text-sm font-medium text-error">{error}</Text>
            </View>
          ) : null}
          
          <Input 
            label="Email" 
            placeholder="you@example.com" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address" 
            autoCapitalize="none" 
            autoComplete="email"
            leftIcon={<Mail size={18} color="#94A3B8" />} 
          />
          
          <Input 
            label="Password" 
            placeholder="Your password" 
            value={password} 
            onChangeText={setPassword}
            secureTextEntry={!showPassword} 
            autoComplete="current-password"
            leftIcon={<Lock size={18} color="#94A3B8" />}
            rightIcon={showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
            onRightIconPress={() => setShowPassword(!showPassword)} 
          />
          
          <Link href="/(auth)/forgot-password" asChild>
            <Text className="text-sm font-semibold text-primary text-right mt-1">
              Forgot password?
            </Text>
          </Link>
          
          <Button 
            label="Sign In" 
            onPress={handleSignIn} 
            isLoading={isLoading === "email"} 
            disabled={isPending} 
            leftIcon={<LogIn size={18} color="#fff" />} 
            className="mt-2"
          />
          
          <View className="flex-row items-center gap-4 my-2">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-xs text-text-secondary">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>
          
          <Button 
            label="Continue with Google" 
            onPress={handleGoogleSignIn} 
            isLoading={isLoading === "google"} 
            disabled={isPending} 
            variant="outline" 
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} className="flex-row justify-center mt-12">
          <Text className="text-base text-text-secondary">Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Text className="text-base font-semibold text-primary">Sign Up</Text>
          </Link>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

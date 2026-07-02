import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  const handleReset = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email"); return; }
    setIsLoading(true);
    try { await forgotPassword(email); setSent(true); }
    catch (err) { setError((err as Error).message); }
    finally { setIsLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-1 p-8 justify-center" keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(100).springify()} className="absolute top-12 left-6">
          <Button 
            label="Back" 
            onPress={() => router.back()} 
            variant="ghost" 
            leftIcon={<ArrowLeft size={18} color="#6366F1" />} 
          />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-8 mb-10">
          {sent ? (
            <View className="items-center gap-5">
              <View className="w-20 h-20 rounded-full bg-success/10 items-center justify-center">
                <CheckCircle2 size={40} color="#22C55E" />
              </View>
              <Text className="text-3xl font-bold text-text text-center">Check your email</Text>
              <Text className="text-base text-text-secondary text-center">We've sent a password reset link to {email}</Text>
              <Button label="Back to Sign In" onPress={() => router.replace("/(auth)/sign-in")} className="w-full mt-4" />
            </View>
          ) : (
            <View>
              <Text className="text-3xl font-bold text-text">Reset password</Text>
              <Text className="text-base text-text-secondary mt-2">Enter your email and we'll send you a reset link</Text>
            </View>
          )}
        </Animated.View>

        {!sent && (
          <Animated.View entering={FadeInDown.delay(300).springify()} className="gap-5">
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
              leftIcon={<Mail size={18} color="#94A3B8" />} 
            />
            <Button 
              label="Send Reset Link" 
              onPress={handleReset} 
              isLoading={isLoading} 
              className="mt-4" 
              leftIcon={<Send size={18} color="#fff" />} 
            />
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Link, router } from "expo-router";
import { useAuthStore } from "../../src/store/auth-store";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.34 2.56 10.42l7.98-5.83z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.83C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState("");
  
  const signUp = useAuthStore((s) => s.signUp);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  const handleSignUp = async () => {
    setError("");
    if (!displayName.trim() || !email.trim() || !password.trim()) { setError("Please fill in all fields"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setIsLoading("email");
    try { await signUp(email, password, displayName); router.replace("/(auth)/sign-in"); }
    catch (err) { setError((err as Error).message); }
    finally { setIsLoading(null); }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading("google");
    try {
      if (Platform.OS !== "web") {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
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
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-1 justify-center p-8" keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-10">
          <Text className="text-3xl font-bold text-text">Create account</Text>
          <Text className="text-base text-text-secondary mt-2">Start organizing your tasks</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} className="gap-5">
          {error ? (
            <View className="p-4 rounded-xl bg-error/10 border border-error/30">
              <Text className="text-sm font-medium text-error">{error}</Text>
            </View>
          ) : null}
          
          <Input 
            label="Display Name" 
            placeholder="John Doe" 
            value={displayName} 
            onChangeText={setDisplayName}
            leftIcon={<User size={18} color="#94A3B8" />} 
          />
          
          <Input 
            label="Email" 
            placeholder="you@example.com" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address" 
            autoCapitalize="none"
            leftIcon={<Mail size={18} color="#94A3B8" />} 
          />
          
          <Input 
            label="Password" 
            placeholder="At least 6 characters" 
            value={password} 
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={18} color="#94A3B8" />}
            rightIcon={showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
            onRightIconPress={() => setShowPassword(!showPassword)} 
          />
          
          <Input 
            label="Confirm Password" 
            placeholder="Repeat your password" 
            value={confirmPassword} 
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock size={18} color="#94A3B8" />} 
          />
          
          <Button 
            label="Create Account" 
            onPress={handleSignUp} 
            isLoading={isLoading === "email"} 
            disabled={isPending} 
            leftIcon={<UserPlus size={18} color="#fff" />} 
            className="mt-4"
          />

          <View className="flex-row items-center gap-4 my-2">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-xs text-text-secondary">or continue with</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          <Button
            label="Continue with Google"
            onPress={handleGoogleSignIn}
            variant="outline"
            disabled={isPending}
            isLoading={isLoading === "google"}
            leftIcon={<GoogleIcon size={18} />}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} className="flex-row justify-center mt-12">
          <Text className="text-base text-text-secondary">Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <Text className="text-base font-semibold text-primary">Sign In</Text>
          </Link>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import { useAuthStore } from "../../src/store/auth-store";
import { useNotificationStore } from "../../src/store/notification-store";
import { exportToJSON, exportBackupCSV } from "../../src/lib/export-data";
import { Card } from "../../src/components/ui/Card";
import { Avatar } from "../../src/components/ui/Avatar";
import { ToggleSwitch } from "../../src/components/ui/ToggleSwitch";
import { ExportDataSheet } from "../../src/components/ui/ExportDataSheet";
import { Bell, BellOff, LogOut, Trash2, ShieldCheck, ChevronRight, FileDown, CalendarClock, Flame } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors } from "../../src/theme";
import { router } from "expo-router";

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const deleteAccount = useAuthStore((s) => s.deleteAccount);

  const settings = useNotificationStore((s) => s.settings);
  const loading = useNotificationStore((s) => s.loading);
  const initialize = useNotificationStore((s) => s.initialize);
  const togglePush = useNotificationStore((s) => s.togglePush);
  const toggleDailyReminder = useNotificationStore((s) => s.toggleDailyReminder);
  const toggleStreakReminder = useNotificationStore((s) => s.toggleStreakReminder);

  const [togglingPush, setTogglingPush] = useState(false);
  const [togglingDaily, setTogglingDaily] = useState(false);
  const [togglingStreak, setTogglingStreak] = useState(false);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => { initialize(); }, []);

  const handleToggle = async (
    toggleFn: (enabled: boolean) => Promise<void>,
    newValue: boolean,
    setLoading: (v: boolean) => void,
  ) => {
    setLoading(true);
    try {
      await toggleFn(newValue);
    } catch (err) {
      const msg = (err as Error).message || "Could not update notification setting.";
      const title = msg.toLowerCase().includes("permission") ? "Permission Denied" : "Error";
      if (Platform.OS === 'web') {
        window.alert(`${title}: ${msg}`);
      } else {
        Alert.alert(title, msg);
      }
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to sign out?")) {
        await signOut();
        router.replace("/(auth)/sign-in");
      }
    } else {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: async () => { await signOut(); router.replace("/(auth)/sign-in"); } },
      ]);
    }
  };

  const handleDeleteAccount = async () => {
    if (Platform.OS === 'web') {
      if (window.confirm("This action cannot be undone. All your data will be permanently deleted. Continue?")) {
        await deleteAccount?.();
        router.replace("/(auth)/sign-in");
      }
    } else {
      Alert.alert(
        "Delete Account",
        "This action cannot be undone. All your data will be permanently deleted from our servers.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: async () => { await deleteAccount?.(); router.replace("/(auth)/sign-in"); } },
        ],
      );
    }
  };

  const handleExportData = () => {
    setShowExport(true);
  };

  const handleExportFormat = async (format: "csv" | "json") => {
    if (format === "json") {
      await exportToJSON();
    } else {
      await exportBackupCSV();
    }
  };

  const pushEnabled = settings?.push_enabled ?? true;
  const dailyEnabled = settings?.daily_reminder_enabled ?? false;
  const streakEnabled = settings?.streak_reminder_enabled ?? false;

  return (
    <View className="flex-1 bg-background items-center">
      <View className="w-full max-w-4xl flex-1">
        {/* HEADER */}
        <View className="pt-16 px-6 pb-5 border-b border-border/80 bg-surface shadow-sm">
          <Text className="text-4xl font-extrabold text-text tracking-tight">Settings</Text>
          <Text className="text-sm font-semibold text-text-secondary mt-1">Manage preferences, notifications & account</Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          contentContainerClassName="pb-36 pt-6"
          showsVerticalScrollIndicator={false}
        >
          {/* PROFILE CARD */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Card className="flex-row items-center gap-4 p-5 border border-border/80 shadow-md">
              <Avatar name={user?.display_name || "Alex Morgan"} size={56} />
              <View className="flex-1">
                <Text className="text-xl font-bold text-text tracking-tight">{user?.display_name || "Alex Morgan"}</Text>
                <Text className="text-sm font-medium text-text-secondary mt-0.5">@{user?.display_name?.toLowerCase().replace(/\s+/g, "") || "alexmorgan"}</Text>
              </View>
              <View className="w-10 h-10 rounded-xl bg-background border border-border/60 items-center justify-center">
                <ChevronRight size={18} color="#94A3B8" />
              </View>
            </Card>
          </Animated.View>

          {/* NOTIFICATIONS */}
          <Animated.View entering={FadeInDown.delay(150).springify()} className="mt-8">
            <Text className="text-[11px] font-bold tracking-widest text-text-tertiary mb-2 ml-1">NOTIFICATIONS & ALERTS</Text>
            <Card className="p-0 overflow-hidden border border-border/80 shadow-sm">
              {[
                {
                  icon: settings?.push_enabled ? Bell : BellOff,
                  label: "Push Notifications",
                  desc: "Receive task reminders and completion alerts",
                  loading: togglingPush,
                  enabled: pushEnabled,
                  onToggle: (v: boolean) => handleToggle(togglePush, v, setTogglingPush),
                },
                {
                  icon: CalendarClock,
                  label: "Daily Reminder",
                  desc: "Review your task schedule every morning",
                  loading: togglingDaily,
                  enabled: dailyEnabled,
                  onToggle: (v: boolean) => handleToggle(toggleDailyReminder, v, setTogglingDaily),
                },
                {
                  icon: Flame,
                  label: "Streak Protection",
                  desc: "Stay motivated and protect your daily streak",
                  loading: togglingStreak,
                  enabled: streakEnabled,
                  onToggle: (v: boolean) => handleToggle(toggleStreakReminder, v, setTogglingStreak),
                },
              ].map((item, i) => (
                <View
                  key={i}
                  className={`flex-row items-center px-5 py-4.5 ${i < 2 ? "border-b border-border/60" : ""}`}
                >
                  <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                    <item.icon size={20} color={item.enabled ? colors.primary : "#94A3B8"} />
                  </View>
                  <Pressable
                    onPress={() => { if (!item.loading) item.onToggle(!item.enabled); }}
                    className="flex-1 gap-0.5"
                  >
                    <Text className="text-base font-bold text-text tracking-tight">{item.label}</Text>
                    <Text className="text-xs font-medium text-text-secondary">{item.desc}</Text>
                  </Pressable>
                  <ToggleSwitch
                    value={item.enabled}
                    onValueChange={item.onToggle}
                    loading={item.loading}
                    accessibilityLabel={item.label}
                  />
                </View>
              ))}
            </Card>
          </Animated.View>

          {/* DATA & BACKUP */}
          <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-8">
            <Text className="text-[11px] font-bold tracking-widest text-text-tertiary mb-2 ml-1">DATA & BACKUP</Text>
            <Card className="p-0 overflow-hidden border border-border/80 shadow-sm">
              <Pressable
                onPress={handleExportData}
                className="flex-row items-center px-5 py-4.5 active:opacity-80"
              >
                <View className="w-11 h-11 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                  <FileDown size={20} color={colors.primary} />
                </View>
                <View className="flex-1 gap-0.5">
                  <Text className="text-base font-bold text-text tracking-tight">Export Task Data</Text>
                  <Text className="text-xs font-medium text-text-secondary">Download tasks, subtasks, categories, and CSV backup</Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            </Card>
          </Animated.View>

          <ExportDataSheet
            visible={showExport}
            onClose={() => setShowExport(false)}
            onExport={handleExportFormat}
          />

          {/* ACCOUNT & SECURITY */}
          <Animated.View entering={FadeInDown.delay(250).springify()} className="mt-8">
            <Text className="text-[11px] font-bold tracking-widest text-text-tertiary mb-2 ml-1">ACCOUNT ACTIONS</Text>
            <Card className="p-0 overflow-hidden border border-border/80 shadow-sm">
              <Pressable
                onPress={handleSignOut}
                className="flex-row items-center px-5 py-4.5 active:opacity-80 border-b border-border/60"
              >
                <View className="w-11 h-11 rounded-2xl bg-error/10 items-center justify-center mr-4">
                  <LogOut size={20} color={colors.danger} />
                </View>
                <Text className="text-base font-bold text-error flex-1 tracking-tight">Sign Out</Text>
                <ChevronRight size={18} color={colors.danger} />
              </Pressable>
              
              <Pressable
                onPress={handleDeleteAccount}
                className="flex-row items-center px-5 py-4.5 active:opacity-80"
              >
                <View className="w-11 h-11 rounded-2xl bg-error/10 items-center justify-center mr-4">
                  <Trash2 size={20} color={colors.danger} />
                </View>
                <Text className="text-base font-bold text-error flex-1 tracking-tight">Delete Account</Text>
                <ChevronRight size={18} color={colors.danger} />
              </Pressable>
            </Card>
          </Animated.View>

          {/* FOOTER */}
          <View className="items-center py-10 gap-2">
            <ShieldCheck size={18} color="#94A3B8" />
            <Text className="text-xs font-semibold text-text-secondary text-center leading-relaxed">
              TaskFlow v1.0.0 • Encrypted Sync{"\n"}All personal data safely encrypted.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

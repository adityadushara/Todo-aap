import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useAuthStore } from "../../src/store/auth-store";
import { useNotificationStore } from "../../src/store/notification-store";
import { exportToJSON, exportBackupCSV } from "../../src/lib/export-data";
import { Card } from "../../src/components/ui/Card";
import { Avatar } from "../../src/components/ui/Avatar";
import { ToggleSwitch } from "../../src/components/ui/ToggleSwitch";
import { ExportDataSheet } from "../../src/components/ui/ExportDataSheet";
import { Bell, BellOff, LogOut, Trash2, ShieldCheck, ChevronRight, FileDown, CalendarClock, Flame } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

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
      Alert.alert(title, msg);
    }
    setLoading(false);
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted from our servers.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteAccount?.() },
      ],
    );
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
    <View className="flex-1 bg-background">
      <View className="pt-20 px-6 pb-4 border-b border-border bg-surface">
        <Text className="text-4xl font-bold text-text tracking-tight">Settings</Text>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerClassName="pb-40 pt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE CARD */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card className="flex-row items-center gap-4">
            <Avatar name={user?.display_name || "User"} size={56} />
            <View className="flex-1">
              <Text className="text-xl font-bold text-text">{user?.display_name || "User"}</Text>
              <Text className="text-sm text-text-secondary">@{user?.display_name?.toLowerCase().replace(/\s+/g, "") || "user"}</Text>
            </View>
            <View className="w-9 h-9 rounded-xl bg-background items-center justify-center">
              <ChevronRight size={16} color="#94A3B8" />
            </View>
          </Card>
        </Animated.View>

        {/* NOTIFICATIONS */}
        <Animated.View entering={FadeInDown.delay(150).springify()} className="mt-8">
          <Text className="text-[11px] font-bold tracking-widest text-text-tertiary mb-2 ml-1">NOTIFICATIONS</Text>
          <Card className="p-0 overflow-hidden">
            {[
              {
                icon: settings?.push_enabled ? Bell : BellOff,
                label: "Push Notifications",
                desc: "Receive task reminders and alerts",
                loading: togglingPush,
                enabled: pushEnabled,
                onToggle: (v: boolean) => handleToggle(togglePush, v, setTogglingPush),
              },
              {
                icon: CalendarClock,
                label: "Daily Reminder",
                desc: "Review your tasks every morning",
                loading: togglingDaily,
                enabled: dailyEnabled,
                onToggle: (v: boolean) => handleToggle(toggleDailyReminder, v, setTogglingDaily),
              },
              {
                icon: Flame,
                label: "Streak Reminder",
                desc: "Stay motivated, protect your streak",
                loading: togglingStreak,
                enabled: streakEnabled,
                onToggle: (v: boolean) => handleToggle(toggleStreakReminder, v, setTogglingStreak),
              },
            ].map((item, i) => (
              <View
                key={i}
                className={`flex-row items-center px-5 py-4 ${i < 2 ? "border-b border-border" : ""}`}
              >
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-4">
                  <item.icon size={20} color={item.enabled ? "#6366F1" : "#94A3B8"} />
                </View>
                <Pressable
                  onPress={() => { if (!item.loading) item.onToggle(!item.enabled); }}
                  className="flex-1 gap-0.5"
                >
                  <Text className="text-base font-semibold text-text">{item.label}</Text>
                  <Text className="text-xs text-text-secondary">{item.desc}</Text>
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

        {/* DATA */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mt-8">
          <Text className="text-[11px] font-bold tracking-widest text-text-tertiary mb-2 ml-1">DATA</Text>
          <Card className="p-0 overflow-hidden">
            <Pressable
              onPress={handleExportData}
              className="flex-row items-center px-5 py-4 active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-4">
                <FileDown size={20} color="#6366F1" />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-semibold text-text">Export Data</Text>
                <Text className="text-xs text-text-secondary">Download your tasks, categories, and stats</Text>
              </View>
              <ChevronRight size={16} color="#94A3B8" />
            </Pressable>
          </Card>
        </Animated.View>

        <ExportDataSheet
          visible={showExport}
          onClose={() => setShowExport(false)}
          onExport={handleExportFormat}
        />

        {/* ACCOUNT */}
        <Animated.View entering={FadeInDown.delay(250).springify()} className="mt-8">
          <Text className="text-[11px] font-bold tracking-widest text-text-tertiary mb-2 ml-1">ACCOUNT</Text>
          <Card className="p-0 overflow-hidden">
            <Pressable
              onPress={handleSignOut}
              className="flex-row items-center px-5 py-4 active:opacity-80 border-b border-border"
            >
              <View className="w-10 h-10 rounded-xl bg-error/10 items-center justify-center mr-4">
                <LogOut size={20} color="#EF4444" />
              </View>
              <Text className="text-base font-semibold text-error flex-1">Sign Out</Text>
              <ChevronRight size={16} color="#EF4444" />
            </Pressable>
            
            <Pressable
              onPress={handleDeleteAccount}
              className="flex-row items-center px-5 py-4 active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-error/10 items-center justify-center mr-4">
                <Trash2 size={20} color="#EF4444" />
              </View>
              <Text className="text-base font-semibold text-error flex-1">Delete Account</Text>
              <ChevronRight size={16} color="#EF4444" />
            </Pressable>
          </Card>
        </Animated.View>

        {/* FOOTER */}
        <View className="items-center py-12 gap-2">
          <ShieldCheck size={16} color="#94A3B8" />
          <Text className="text-xs text-text-secondary text-center">
            Your data is synced and secured{"\n"}with end-to-end encryption.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Platform } from "react-native";
import type { UserSettings } from "../types";

const isNative = Platform.OS !== "web";

let Notifications: typeof import("expo-notifications") | null = null;
if (isNative) {
  try {
    Notifications = require("expo-notifications");
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch {
    Notifications = null;
  }
}

const DAILY_REMINDER_ID = "daily-reminder";
const STREAK_REMINDER_ID = "streak-reminder";

/**
 * Maps frontend setting keys to actual database column names.
 * Detected at runtime based on which columns exist in the table.
 */
const FRONTEND_KEYS = [
  "push_enabled",
  "daily_reminder_enabled",
  "streak_reminder_enabled",
  "daily_reminder_time",
  "streak_reminder_time",
] as const;

type FrontendKey = (typeof FRONTEND_KEYS)[number];

const LEGACY_COLUMN_MAP: Record<FrontendKey, string> = {
  push_enabled: "notifications_enabled",
  daily_reminder_enabled: "notifications_enabled",
  streak_reminder_enabled: "notifications_enabled",
  daily_reminder_time: "notification_time",
  streak_reminder_time: "notification_time",
};

interface NotificationState {
  settings: UserSettings | null;
  loading: boolean;
  initialized: boolean;
  permissionGranted: boolean;
  columnMap: Record<string, string> | null;
  initialize: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  togglePush: (enabled: boolean) => Promise<void>;
  toggleDailyReminder: (enabled: boolean) => Promise<void>;
  toggleStreakReminder: (enabled: boolean) => Promise<void>;
  scheduleDailyReminder: () => Promise<void>;
  scheduleStreakReminder: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  settings: null,
  loading: false,
  initialized: false,
  permissionGranted: false,
  columnMap: null,

  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    if (isNative && Notifications) {
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        set({ permissionGranted: existingStatus === "granted" });
      } catch {
        // Notifications permission check failed
      }
    }
    await get().fetchSettings();
  },

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ loading: false }); return; }

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[fetchSettings] Supabase error:", { code: error.code, message: error.message, details: error.details, hint: error.hint });
        set({ loading: false });
        return;
      }

      if (data) {
        const columnMap = buildColumnMap(data);
        const normalized = normalizeSettings(data, columnMap);
        set({ settings: normalized, columnMap, loading: false });
        return;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("user_settings")
        .insert({ user_id: user.id })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("[fetchSettings] Insert error:", { code: insertError.code, message: insertError.message, details: insertError.details, hint: insertError.hint });
        set({ loading: false });
        return;
      }

      if (inserted) {
        const columnMap = buildColumnMap(inserted);
        const normalized = normalizeSettings(inserted, columnMap);
        set({ settings: normalized, columnMap, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error("[fetchSettings] Unexpected error:", err);
      set({ loading: false });
    }
  },

  updateSetting: async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const previous = get().settings;
    const columnMap = get().columnMap || {};

    const next = { ...(previous || {}), [key]: value } as UserSettings;
    set({ settings: next });

    const dbColumn = columnMap[key as FrontendKey] || key;
    const payload = { user_id: user.id, [dbColumn]: value };
    console.log("[updateSetting] Payload:", JSON.stringify(payload), "(frontend key:", key, "-> db column:", dbColumn, ")");

    const { error: updateError, status } = await supabase
      .from("user_settings")
      .update({ [dbColumn]: value })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("[updateSetting] Update error:", { httpStatus: status, code: updateError.code, message: updateError.message, details: updateError.details, hint: updateError.hint, payload });
      set({ settings: previous });
      throw new Error(`Update failed (HTTP ${status}): ${updateError.message}`);
    }

    const { data: checkRows } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!checkRows) {
      const { error: insertError } = await supabase
        .from("user_settings")
        .insert(payload);

      if (insertError) {
        console.error("[updateSetting] Insert error:", { code: insertError.code, message: insertError.message, details: insertError.details, hint: insertError.hint, payload });
        set({ settings: previous });
        throw new Error(`Insert failed: ${insertError.message}`);
      }
    }
  },

  togglePush: async (enabled: boolean) => {
    if (!isNative || !Notifications) {
      await get().updateSetting("push_enabled", enabled);
      return;
    }
    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        set({ permissionGranted: false });
        throw new Error("Notification permission not granted. Enable notifications in your device settings.");
      }
      set({ permissionGranted: true });
      await get().updateSetting("push_enabled", true);
      const s = get().settings;
      if (s?.daily_reminder_enabled) await get().scheduleDailyReminder();
      if (s?.streak_reminder_enabled) await get().scheduleStreakReminder();
    } else {
      await get().cancelAllNotifications();
      await get().updateSetting("push_enabled", false);
    }
  },

  toggleDailyReminder: async (enabled: boolean) => {
    if (!isNative || !Notifications) {
      await get().updateSetting("daily_reminder_enabled", enabled);
      return;
    }
    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        set({ permissionGranted: false });
        throw new Error("Notification permission not granted. Enable notifications in your device settings.");
      }
      set({ permissionGranted: true });
      await get().scheduleDailyReminder();
    } else {
      await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
    }
    await get().updateSetting("daily_reminder_enabled", enabled);
  },

  toggleStreakReminder: async (enabled: boolean) => {
    if (!isNative || !Notifications) {
      await get().updateSetting("streak_reminder_enabled", enabled);
      return;
    }
    if (enabled) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        set({ permissionGranted: false });
        throw new Error("Notification permission not granted. Enable notifications in your device settings.");
      }
      set({ permissionGranted: true });
      await get().scheduleStreakReminder();
    } else {
      await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID);
    }
    await get().updateSetting("streak_reminder_enabled", enabled);
  },

  scheduleDailyReminder: async () => {
    if (!isNative || !Notifications) return;
    const time = get().settings?.daily_reminder_time || "09:00";
    const [hour, minute] = time.split(":").map(Number);
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_ID,
      content: {
        title: "Daily Task Reminder",
        body: "Time to review your tasks for today!",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  },

  scheduleStreakReminder: async () => {
    if (!isNative || !Notifications) return;
    const time = get().settings?.streak_reminder_time || "18:00";
    const [hour, minute] = time.split(":").map(Number);
    await Notifications.cancelScheduledNotificationAsync(STREAK_REMINDER_ID);
    await Notifications.scheduleNotificationAsync({
      identifier: STREAK_REMINDER_ID,
      content: {
        title: "Streak Check",
        body: "Don't break your streak! Complete a task today.",
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute },
    });
  },

  cancelAllNotifications: async () => {
    if (!isNative || !Notifications) return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
}));

function buildColumnMap(dbRow: Record<string, unknown>): Record<string, string> {
  const keys = Object.keys(dbRow);
  const hasNewColumns = keys.includes("push_enabled");

  if (hasNewColumns) {
    const map: Record<string, string> = {};
    for (const fk of FRONTEND_KEYS) {
      map[fk] = fk;
    }
    return map;
  }

  console.log("[notification-store] Using legacy schema column mapping (notifications_enabled)");
  return { ...LEGACY_COLUMN_MAP };
}

function normalizeSettings(dbRow: Record<string, unknown>, columnMap: Record<string, string>): UserSettings {
  const settings: Record<string, unknown> = {
    id: dbRow.id,
    user_id: dbRow.user_id,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
  };

  for (const fk of FRONTEND_KEYS) {
    const dbColumn = columnMap[fk];
    if (dbColumn in dbRow) {
      settings[fk] = dbRow[dbColumn];
    } else {
      settings[fk] = fk.endsWith("_time") ? "09:00" : true;
    }
  }

  return settings as unknown as UserSettings;
}

import { create } from "zustand";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";

WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: Profile | null;
  session: unknown | null;
  isLoading: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const MAX_RETRIES = 3;

async function ensureProfile(
  userId: string,
  userMetadata?: { full_name?: string | null; avatar_url?: string | null },
): Promise<Profile> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return existing;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          display_name: userMetadata?.full_name ?? null,
          avatar_url: userMetadata?.avatar_url ?? null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        return {
          id: userId,
          display_name: userMetadata?.full_name ?? null,
          avatar_url: userMetadata?.avatar_url ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
      await new Promise((r) => setTimeout(r, attempt * 1000));
    }
  }
  throw new Error("Failed to create profile");
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await ensureProfile(session.user.id, session.user.user_metadata);
        set({ user: profile, session, isLoading: false });
      } else {
        set({ isLoading: false });
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await ensureProfile(session.user.id, session.user.user_metadata);
          set({ user: profile, session });
        } else {
          set({ user: null, session: null });
        }
      });
    } catch {
      set({ isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
    if (error) throw error;
  },

  signInWithGoogle: async () => {
    console.log("[GoogleAuth] Button pressed");
    const redirectTo = makeRedirectUri();
    console.log("[GoogleAuth] Starting OAuth with redirect:", redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) throw error;
    if (!data.url) throw new Error("No OAuth URL returned");

    console.log("[GoogleAuth] Browser opened");
    if (Platform.OS === "web") {
      window.location.href = data.url;
      return;
    }

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    console.log("[GoogleAuth] Redirect received", res.type);

    if (res.type === "success") {
      const { url } = res;
      const { params, errorCode } = QueryParams.getQueryParams(url);
      if (errorCode) throw new Error(errorCode);
      
      if (params.access_token && params.refresh_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (sessionError) throw sessionError;
        console.log("[GoogleAuth] Session created");
      } else {
        throw new Error("No session tokens found in the redirect URL.");
      }
    }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, session: null });
  },

  forgotPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "fe://reset-password",
    });
    if (error) throw error;
  },

  updateProfile: async (data: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id);
    if (error) throw error;
    set((state) => ({ user: state.user ? { ...state.user, ...data } : null }));
  },

  deleteAccount: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;
    set({ user: null, session: null });
  },
}));

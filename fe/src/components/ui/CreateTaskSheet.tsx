import { useCallback, useRef, useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, Pressable, Platform, KeyboardAvoidingView, ActivityIndicator, ScrollView, Modal, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming, interpolateColor } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as DocumentPicker from "expo-document-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors, borderRadius, spacing, typography } from "../../theme";
import type { TodoPriority } from "../../types";
import { Calendar, Bell, Paperclip, CheckSquare, X, Check, FileText } from "lucide-react-native";
import { useUIStore } from "../../store/ui-store";
import { useTodoStore } from "../../store/todo-store";
import { supabase } from "../../lib/supabase";

const PRIORITIES: { value: TodoPriority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "#10B981" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "high", label: "High", color: "#F97316" },
  { value: "urgent", label: "Urgent", color: "#EF4444" },
];

interface FieldErrors {
  title?: string;
  description?: string;
  priority?: string;
  due_date?: string;
  reminder?: string;
}

export function CreateTaskSheet() {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const submittingRef = useRef(false);
  
  const isCreateTaskOpen = useUIStore((s) => s.isCreateTaskOpen);
  const closeCreateTask = useUIStore((s) => s.closeCreateTask);
  const createTodo = useTodoStore((s) => s.createTodo);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TodoPriority>("medium");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [reminder, setReminder] = useState<Date | null>(null);
  
  const [attachments, setAttachments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [subtasks, setSubtasks] = useState<{ id: string; title: string }[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const snapPoints = useMemo(() => [650, "90%"], []);

  const handleSheetChange = useCallback((index: number) => {
    if (index === -1) {
      closeCreateTask();
    }
  }, [closeCreateTask]);

  useEffect(() => {
    if (isCreateTaskOpen) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isCreateTaskOpen]);

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ multiple: true });
      if (result.canceled) return;
      setAttachments([...attachments, ...result.assets]);
    } catch (err) {
      console.error(err);
      setError("Failed to attach file");
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleAddSubtask = () => {
    const t = newSubtaskTitle.trim();
    if (!t) return;
    setSubtasks([...subtasks, { id: Date.now().toString(), title: t }]);
    setNewSubtaskTitle("");
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const uploadAttachment = async (todoId: string, asset: DocumentPicker.DocumentPickerAsset) => {
    if (!asset.uri) return;
    let fileBody: any;
    
    if (Platform.OS === 'web') {
      const res = await fetch(asset.uri);
      fileBody = await res.blob();
    } else {
      fileBody = asset.uri; // Or handle native file upload correctly via FormData
    }

    const fileName = `${todoId}/${Date.now()}-${asset.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(fileName, fileBody, { contentType: asset.mimeType || "application/octet-stream" });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return null;
    }

    return uploadData.path;
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    setError("");
    setFieldErrors({});

    const t = title.trim();
    if (!t) { setFieldErrors({ title: "Title is required" }); return; }

    submittingRef.current = true;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Create Main Todo
      const { data: newTodo, error: createError } = await supabase
        .from("todos")
        .insert({
          user_id: user.id,
          title: t,
          description: description.trim() || null,
          priority,
          status: "pending",
          due_date: dueDate ? dueDate.toISOString() : null,
        })
        .select()
        .single();

      if (createError) throw createError;
      if (!newTodo) throw new Error("Failed to create todo");

      // 2. Upload Attachments & Insert Records
      if (attachments.length > 0) {
        for (const asset of attachments) {
          const path = await uploadAttachment(newTodo.id, asset);
          if (path) {
            await supabase.from("attachments").insert({
              todo_id: newTodo.id,
              file_name: asset.name,
              file_size: asset.size || 0,
              file_type: asset.mimeType || "unknown",
              storage_path: path
            });
          }
        }
      }

      // 3. Create Subtasks
      if (subtasks.length > 0) {
        const subtaskInserts = subtasks.map(st => ({
          user_id: user.id,
          parent_id: newTodo.id,
          title: st.title,
          priority: "medium", // Default for subtasks
          status: "pending"
        }));
        await supabase.from("todos").insert(subtaskInserts);
      }

      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      
      // Refresh global state
      await useTodoStore.getState().fetchTodos();

      setTimeout(() => {
        setSuccess(false);
        setTitle(""); setDescription(""); setPriority("medium"); 
        setDueDate(null); setReminder(null);
        setAttachments([]); setSubtasks([]); setNewSubtaskTitle("");
        setFieldErrors({});
        submittingRef.current = false;
        closeCreateTask();
      }, 800);
    } catch (err) {
      console.error(err);
      setError((err as Error).message || "Failed to create task");
      setSuccess(false);
      setLoading(false);
      submittingRef.current = false;
    }
  };

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.3} />
  ), []);

  const createBtnScale = useSharedValue(1);
  const createBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: createBtnScale.value }] }));

  const isValid = title.trim().length > 0;

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: isCreateTaskOpen ? "auto" : "none", zIndex: 9999 }}>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        keyboardBehavior="extend"
        handleComponent={() => (
          <View style={{ paddingTop: 16, paddingBottom: 16, alignItems: "center" }}>
            <View style={{ width: 40, height: 5, borderRadius: 2.5, backgroundColor: "#E2E8F0" }} />
          </View>
        )}
        backgroundStyle={{
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 16,
          elevation: 10,
        }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <BottomSheetScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100 }}
            keyboardShouldPersistTaps="handled"
          >
            {error ? (
              <View style={{ padding: 12, borderRadius: 8, backgroundColor: "#FEF2F2", marginBottom: 16 }}>
                <Text style={{ fontSize: 14, color: "#EF4444" }}>{error}</Text>
              </View>
            ) : null}

            {/* TITLE INPUT */}
            <TextInput
              value={title}
              onChangeText={(t) => { setTitle(t); if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: undefined }); }}
              placeholder="Title"
              placeholderTextColor="#94A3B8"
              style={{ fontSize: 24, fontWeight: "600", color: "#0F172A", paddingVertical: 12, outlineStyle: "none" as any }}
              autoFocus={Platform.OS !== "web"}
            />
            {fieldErrors.title && <Text style={{ color: "#EF4444", fontSize: 13, marginBottom: 8 }}>{fieldErrors.title}</Text>}

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Notes..."
              placeholderTextColor="#94A3B8"
              multiline
              style={{ fontSize: 16, color: "#475569", minHeight: 60, paddingVertical: 8, textAlignVertical: "top", outlineStyle: "none" as any }}
            />

            <View style={{ height: 1, backgroundColor: "#F1F5F9", marginVertical: 16 }} />

            {/* DATE & REMINDER */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
              >
                <Calendar size={16} color="#64748B" />
                <Text style={{ fontSize: 14, color: "#0F172A", fontWeight: "500" }}>
                  {dueDate ? dueDate.toLocaleDateString() : "Today"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setShowTimePicker(true)}
                style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#F8FAFC", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}
              >
                <Bell size={16} color="#64748B" />
                <Text style={{ fontSize: 14, color: "#0F172A", fontWeight: "500" }}>
                  {reminder ? reminder.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Reminder"}
                </Text>
              </Pressable>
            </View>

            {/* PLATFORM DATE PICKERS */}
            {Platform.OS === 'web' && showDatePicker && (
              <View style={{ marginBottom: 16 }}>
                <input 
                  type="date" 
                  onChange={(e) => { setDueDate(new Date(e.target.value)); setShowDatePicker(false); }}
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }}
                />
              </View>
            )}
            {Platform.OS === 'web' && showTimePicker && (
              <View style={{ marginBottom: 16 }}>
                <input 
                  type="time" 
                  onChange={(e) => { 
                    const [h, m] = e.target.value.split(':');
                    const d = new Date();
                    d.setHours(parseInt(h), parseInt(m));
                    setReminder(d); 
                    setShowTimePicker(false); 
                  }}
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }}
                />
              </View>
            )}
            {Platform.OS !== 'web' && showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={(e, date) => { setShowDatePicker(false); if (date) setDueDate(date); }}
              />
            )}
            {Platform.OS !== 'web' && showTimePicker && (
              <DateTimePicker
                value={reminder || new Date()}
                mode="time"
                display="default"
                onChange={(e, date) => { setShowTimePicker(false); if (date) setReminder(date); }}
              />
            )}

            {/* PRIORITY */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#64748B", marginBottom: 12 }}>Priority</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.value;
                  return (
                    <Pressable
                      key={p.value}
                      onPress={() => setPriority(p.value)}
                      style={{
                        paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12,
                        backgroundColor: isSelected ? p.color : "transparent",
                        borderWidth: 1, borderColor: isSelected ? p.color : "#E2E8F0",
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: isSelected ? "600" : "500", color: isSelected ? "#fff" : "#475569" }}>
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ATTACHMENTS */}
            <View style={{ marginBottom: 24 }}>
              <Pressable onPress={handleAttachFile} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Paperclip size={18} color="#64748B" />
                  <Text style={{ fontSize: 15, color: "#0F172A", fontWeight: "500" }}>Attachments</Text>
                </View>
                <Text style={{ color: "#94A3B8", fontSize: 14 }}>Add {'>'}</Text>
              </Pressable>
              {attachments.map((file, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, paddingLeft: 30 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <FileText size={16} color="#94A3B8" />
                    <Text style={{ fontSize: 14, color: "#475569" }} numberOfLines={1}>{file.name}</Text>
                  </View>
                  <Pressable onPress={() => removeAttachment(i)} hitSlop={10}><X size={16} color="#94A3B8" /></Pressable>
                </View>
              ))}
            </View>

            {/* SUBTASKS */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" }}>
                <CheckSquare size={18} color="#64748B" />
                <Text style={{ fontSize: 15, color: "#0F172A", fontWeight: "500" }}>Subtasks</Text>
              </View>
              {subtasks.map((st) => (
                <View key={st.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, paddingLeft: 30 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                    <View style={{ width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: "#CBD5E1" }} />
                    <Text style={{ fontSize: 15, color: "#0F172A" }}>{st.title}</Text>
                  </View>
                  <Pressable onPress={() => removeSubtask(st.id)} hitSlop={10}><X size={16} color="#94A3B8" /></Pressable>
                </View>
              ))}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingLeft: 30, marginTop: 8 }}>
                <TextInput
                  value={newSubtaskTitle}
                  onChangeText={setNewSubtaskTitle}
                  onSubmitEditing={handleAddSubtask}
                  placeholder="Add a subtask..."
                  placeholderTextColor="#94A3B8"
                  style={{ flex: 1, fontSize: 15, color: "#0F172A", outlineStyle: "none" as any }}
                />
              </View>
            </View>
          </BottomSheetScrollView>

          {/* STICKY FOOTER */}
          <View style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === "web" ? 20 : insets.bottom || 20,
            backgroundColor: "#FFFFFF", borderTopWidth: 1, borderTopColor: "#F1F5F9",
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
          }}>
            <Pressable onPress={closeCreateTask} style={{ padding: 12 }}>
              <Text style={{ fontSize: 16, color: "#64748B" }}>Cancel</Text>
            </Pressable>

            <Animated.View style={[createBtnStyle]}>
              <Pressable
                onPress={handleSubmit}
                disabled={loading || success || !isValid}
                onPressIn={() => { createBtnScale.value = withSpring(0.95); }}
                onPressOut={() => { createBtnScale.value = withSpring(1); }}
                style={{
                  backgroundColor: success ? "#10B981" : !isValid ? "#E2E8F0" : "#6366F1",
                  height: 48, paddingHorizontal: 32, borderRadius: 24,
                  flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {loading ? <ActivityIndicator size="small" color="#fff" /> : 
                 success ? <Check size={20} color="#fff" /> : 
                 <Text style={{ fontSize: 16, color: !isValid ? "#94A3B8" : "#fff", fontWeight: "600" }}>Save</Text>}
              </Pressable>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </BottomSheet>
    </View>
  );
}

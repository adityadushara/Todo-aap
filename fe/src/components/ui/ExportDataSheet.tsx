import { useCallback, useRef, useState, useEffect } from "react";
import { View, Text, Pressable, Platform, ActivityIndicator } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView, type BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors, typography, shadow } from "../../theme";
import { CheckCircle2, FileDown, AlertCircle } from "lucide-react-native";

interface ExportDataSheetProps {
  visible: boolean;
  onClose: () => void;
  onExport: (format: "csv" | "json") => Promise<void>;
  onSheetChange?: (index: number) => void;
  onSuccess?: () => void;
}

export function ExportDataSheet({ visible, onClose, onExport, onSheetChange, onSuccess }: ExportDataSheetProps) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const exportingRef = useRef(false);
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const snapPoints = ["50%", "65%"];

  const handleSheetChange = useCallback((index: number) => {
    onSheetChange?.(index);
    if (index === -1) onClose();
  }, [onClose, onSheetChange]);

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const handleExport = async () => {
    if (exportingRef.current) return;
    setError("");

    exportingRef.current = true;
    setLoading(true);
    try {
      await onExport(format);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        setSuccess(false);
        exportingRef.current = false;
        sheetRef.current?.dismiss();
      }, 2000);
    } catch (err) {
      setError("Couldn't export your data.\nPlease try again.");
      setSuccess(false);
      setLoading(false);
      exportingRef.current = false;
    }
  };

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  ), []);

  const successScale = useSharedValue(0);
  const successAnim = useAnimatedStyle(() => ({ transform: [{ scale: successScale.value }] }));

  useEffect(() => {
    if (success) successScale.value = withSpring(1, { damping: 12, stiffness: 200 });
    else successScale.value = 0;
  }, [success]);

  const formats = [
    { id: "csv", label: "CSV Export", desc: "Native spreadsheet format compatible with Excel and Google Sheets." },
    { id: "json", label: "JSON Backup", desc: "Raw machine-readable data backup." },
  ] as const;

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChange}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleComponent={() => (
        <View style={{ paddingTop: 12, paddingBottom: 8, alignItems: "center" }}>
          <View style={{ width: 48, height: 5, borderRadius: 2.5, backgroundColor: "#D1D5DB" }} />
        </View>
      )}
      backgroundStyle={{
        backgroundColor: colors.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 20,
      }}
    >
      <View style={{ flex: 1 }}>
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 140,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginBottom: 24, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primaryGlow, alignItems: "center", justifyContent: "center" }}>
              <FileDown size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={[typography.title2, { color: colors.text, marginBottom: 4 }]}>
                Export Data
              </Text>
              <Text style={[typography.callout, { color: colors.textSecondary }]}>
                Download your tasks and stats.
              </Text>
            </View>
          </View>

          {error ? (
            <View style={{ padding: 12, borderRadius: 12, backgroundColor: colors.dangerLight, borderWidth: 1, borderColor: colors.danger + "30", marginBottom: 16 }}>
              <Text style={[typography.subhead, { color: colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          <View style={{ marginBottom: 24 }}>
            <Text style={[typography.caption1, { color: colors.textSecondary, fontWeight: "600", marginBottom: 12, letterSpacing: 0.3 }]}>
              CHOOSE FORMAT
            </Text>
            <View style={{ gap: 12 }}>
              {formats.map((f) => {
                const isSelected = format === f.id;
                return (
                  <Pressable
                    key={f.id}
                    onPress={() => {
                      if (!loading && !success) {
                        setFormat(f.id);
                        if (Platform.OS !== "web") Haptics.selectionAsync();
                      }
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: isSelected ? colors.primaryGlow : colors.background,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.callout, { color: isSelected ? colors.primary : colors.text, fontWeight: "600", marginBottom: 2 }]}>
                        {f.label}
                      </Text>
                      <Text style={[typography.caption1, { color: isSelected ? colors.primary : colors.textTertiary, opacity: 0.8 }]}>
                        {f.desc}
                      </Text>
                    </View>
                    <View style={{
                      width: 24, height: 24, borderRadius: 12,
                      borderWidth: 2, borderColor: isSelected ? colors.primary : colors.border,
                      alignItems: "center", justifyContent: "center",
                    }}>
                      {isSelected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

        </BottomSheetScrollView>

        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 16), paddingTop: 12,
          backgroundColor: colors.surface,
          borderTopWidth: 1, borderTopColor: colors.borderLight,
          gap: 10,
        }}>
          <Pressable
            onPress={handleExport}
            disabled={loading || success}
            style={({ pressed }) => ({
              height: 56, borderRadius: 28,
              backgroundColor: loading ? colors.primary : success ? colors.success : colors.primary,
              alignItems: "center", justifyContent: "center",
              opacity: pressed && !loading && !success ? 0.95 : 1,
              transform: [{ scale: pressed && !loading && !success ? 0.98 : 1 }],
              ...shadow(3),
            })}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[typography.headline, { color: "#fff", fontWeight: "700" }]}>Preparing backup...</Text>
              </View>
            ) : success ? (
              <Animated.View style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, successAnim]}>
                <CheckCircle2 size={20} color="#fff" />
                <Text style={[typography.headline, { color: "#fff", fontWeight: "700" }]}>Backup exported successfully.</Text>
              </Animated.View>
            ) : (
              <Text style={[typography.headline, { color: "#fff", fontWeight: "700" }]}>Export Data</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => { sheetRef.current?.dismiss(); }}
            disabled={loading}
            style={{ alignItems: "center", paddingVertical: 8 }}
            hitSlop={12}
          >
            <Text style={[typography.subhead, { color: colors.textSecondary, fontWeight: "500" }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheetModal>
  );
}

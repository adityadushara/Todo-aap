import { View, Text } from "react-native";
import { colors, borderRadius, typography, spacing } from "../../theme";

interface BadgeProps {
  label: string;
  color: string;
}

export function Badge({ label, color }: BadgeProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: borderRadius.full, backgroundColor: color + "15", gap: spacing.xs }}>
      <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: color }} />
      <Text style={[typography.caption1, { color, fontWeight: "600" }]}>{label}</Text>
    </View>
  );
}

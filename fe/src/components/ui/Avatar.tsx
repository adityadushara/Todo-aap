import { View, Text } from "react-native";
import { colors } from "../../theme";

interface AvatarProps {
  name: string;
  size?: number;
  uri?: string | null;
}

export function Avatar({ name, size = 48 }: AvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontSize: size * 0.4, fontWeight: "600" }}>{initials}</Text>
    </View>
  );
}

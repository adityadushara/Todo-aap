import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors, typography } from "../../theme";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

export function ProgressRing({ progress, size = 100, strokeWidth = 8, color, trackColor, label }: ProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const c = color ?? colors.primary;
  const track = trackColor ?? colors.borderLight;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped);
  const center = size / 2;

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={center} cy={center} r={radius} stroke={track} strokeWidth={strokeWidth} fill="none" />
        <Circle cx={center} cy={center} r={radius} stroke={c} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" transform={`rotate(-90 ${center} ${center})`} />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text style={[typography.statValue, { color: colors.text, fontSize: size * 0.24 }]}>
          {Math.round(clamped * 100)}%
        </Text>
        {label && <Text style={[typography.caption1, { color: colors.textSecondary, marginTop: -2 }]}>{label}</Text>}
      </View>
    </View>
  );
}

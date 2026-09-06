import { type ComponentType } from "react";
import {
  BarChart3,
  Circle,
  Code,
  ChevronRight,
  Home,
  MessageCircle,
  Send,
  Settings,
  Shield,
  User,
} from "lucide-react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

/**
 * IconSymbol — maps the icon names used in the app to lucide-react-native
 * glyphs. Add new mappings as needed.
 */
const MAPPING: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  "house.fill": Home,
  "paperplane.fill": Send,
  "chevron.left.forwardslash.chevron.right": Code,
  "chevron.right": ChevronRight,
  "shield.fill": Shield,
  "message.fill": MessageCircle,
  "person.fill": User,
  "chart.bar.fill": BarChart3,
  "gearshape.fill": Settings,
};

export type IconSymbolName = keyof {
  [K in keyof typeof MAPPING]: K;
};

export type IconSymbolProps = {
  name: IconSymbolName;
  size?: number;
  color?: string;
} & Record<string, unknown>;

export function IconSymbol({ name, size = 24, color, ...rest }: IconSymbolProps) {
  const themeColor = useThemeColor({}, "textPrimary");

  const IconComponent = MAPPING[name] ?? Circle;

  return <IconComponent size={size} color={color ?? themeColor} {...rest} />;
}

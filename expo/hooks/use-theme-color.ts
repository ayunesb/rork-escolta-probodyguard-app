import { useMemo } from "react";
import { useColorScheme } from "./use-color-scheme";

import Colors, { type ThemeColorName } from "@/constants/colors";

/**
 * useThemeColor — resolves a semantic color name against the active theme.
 * The app is dark-first, so unknown names fall back to the dark palette.
 */
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ThemeColorName,
): string {
  const theme = useColorScheme() ?? "dark";
  const isDarkMode = theme === "dark";

  return useMemo(() => {
    const fromProps = isDarkMode ? props.dark : props.light;
    if (fromProps) {
      return fromProps;
    }
    return Colors[colorName] ?? Colors.textPrimary;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDarkMode, colorName, props.dark, props.light]);
}
